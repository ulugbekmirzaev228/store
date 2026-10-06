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
    const { nameUz, nameRu, slug, icon, order, parentId } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Kategoriya topilmadi' }, { status: 404 });
    }

    let finalSlug = existing.slug;
    if (slug && slug.trim() !== existing.slug) {
      finalSlug = slugify(slug);
      const duplicate = await prisma.category.findFirst({
        where: { slug: finalSlug, NOT: { id } },
      });
      if (duplicate) {
        return NextResponse.json({ message: 'Bunday slug bilan boshqa kategoriya mavjud' }, { status: 400 });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(nameUz ? { nameUz: nameUz.trim() } : {}),
        ...(nameRu !== undefined ? { nameRu: nameRu.trim() } : {}),
        slug: finalSlug,
        ...(icon !== undefined ? { icon } : {}),
        ...(order !== undefined ? { order: parseInt(order, 10) || 0 } : {}),
        ...(parentId !== undefined ? { parentId: parentId || null } : {}),
      },
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
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ message: 'Kategoriya topilmadi' }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { message: `Oʻchirish mumkin emas: Ushbu kategoriyada ${category._count.products} ta mahsulot mavjud. Avval mahsulotlar kategoriyasini oʻzgartiring.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: 'Kategoriya muvaffaqiyatli oʻchirildi' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
