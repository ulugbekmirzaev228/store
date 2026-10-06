import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        variants: {
          orderBy: { price: 'asc' },
          include: { images: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
        },
        specs: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Mahsulot topilmadi' }, { status: 404 });
    }

    // Similar products
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isPublished: true,
      },
      take: 4,
      include: {
        brand: true,
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        variants: { orderBy: { price: 'asc' } },
      },
    });

    return NextResponse.json({
      product,
      similarProducts,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Xatolik' }, { status: 500 });
  }
}
