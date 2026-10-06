import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../lib/server-auth';

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

export async function GET(req: NextRequest) {
  const auth = verifyAdminToken(req);
  if (!auth) {
    return NextResponse.json({ message: 'Avtorizatsiyadan oʻtilmagan' }, { status: 401 });
  }

  try {
    const brands = await prisma.brand.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(brands);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminToken(req, ['ADMIN']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, slug, logoUrl, isFeatured = false, order = 0 } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Brend nomi kiritilishi shart' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const finalSlug = (slug?.trim() || slugify(trimmedName) || `brand-${Date.now()}`).toLowerCase();

    // Check uniqueness
    const existing = await prisma.brand.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedName, mode: 'insensitive' } },
          { slug: finalSlug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Bunday nom yoki slug bilan brend allaqachon mavjud' }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name: trimmedName,
        slug: finalSlug,
        logoUrl: logoUrl?.trim() || null,
        isFeatured: Boolean(isFeatured),
        order: parseInt(order, 10) || 0,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
