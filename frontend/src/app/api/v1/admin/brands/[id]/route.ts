import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req, ['ADMIN']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { name, slug, logoUrl, isFeatured, order } = body;

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Brend topilmadi' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (name && name.trim()) {
      const trimmedName = name.trim();
      const duplicateName = await prisma.brand.findFirst({
        where: { name: { equals: trimmedName, mode: 'insensitive' }, NOT: { id } },
      });
      if (duplicateName) {
        return NextResponse.json({ message: 'Bunday nomli boshqa brend mavjud' }, { status: 400 });
      }
      dataToUpdate.name = trimmedName;
    }

    if (slug && slug.trim()) {
      const finalSlug = slugify(slug);
      const duplicateSlug = await prisma.brand.findFirst({
        where: { slug: finalSlug, NOT: { id } },
      });
      if (duplicateSlug) {
        return NextResponse.json({ message: 'Bunday slug bilan boshqa brend mavjud' }, { status: 400 });
      }
      dataToUpdate.slug = finalSlug;
    }

    if (logoUrl !== undefined) {
      dataToUpdate.logoUrl = logoUrl ? logoUrl.trim() : null;
    }

    if (isFeatured !== undefined) {
      dataToUpdate.isFeatured = Boolean(isFeatured);
    }

    if (order !== undefined) {
      dataToUpdate.order = parseInt(order, 10) || 0;
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: dataToUpdate,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req, ['ADMIN']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const { id } = params;
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!brand) {
      return NextResponse.json({ message: 'Brend topilmadi' }, { status: 404 });
    }

    if (brand._count.products > 0) {
      return NextResponse.json(
        { message: `Oʻchirish mumkin emas: Ushbu brendga ${brand._count.products} ta mahsulot biriktirilgan. Avval mahsulotlar brendini oʻzgartiring.` },
        { status: 400 }
      );
    }

    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ message: 'Brend muvaffaqiyatli oʻchirildi' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
