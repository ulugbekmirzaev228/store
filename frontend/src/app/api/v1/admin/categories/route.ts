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
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(categories);
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
    const { nameUz, nameRu, slug, icon, order, parentId } = body;

    if (!nameUz) {
      return NextResponse.json({ message: 'Kategoriya nomi kiritilishi shart' }, { status: 400 });
    }

    const finalSlug = (slug?.trim() || slugify(nameUz) || `cat-${Date.now()}`).toLowerCase();

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      return NextResponse.json({ message: 'Bunday slug bilan kategoriya allaqachon mavjud' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        nameUz: nameUz.trim(),
        nameRu: (nameRu?.trim() || nameUz).trim(),
        slug: finalSlug,
        icon: icon || 'Smartphone',
        order: parseInt(order, 10) || 0,
        parentId: parentId || null,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
