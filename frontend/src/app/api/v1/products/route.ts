import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const isHit = searchParams.get('isHit');
    const isNew = searchParams.get('isNew');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = { isPublished: true };

    if (brand) {
      where.brand = { slug: brand };
    }
    if (category) {
      where.category = { slug: category };
    }
    if (isHit === 'true') {
      where.isHit = true;
    }
    if (isNew === 'true') {
      where.isNew = true;
    }
    if (search) {
      const q = search.trim();
      where.OR = [
        { nameUz: { contains: q, mode: 'insensitive' } },
        { nameRu: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = [{ isHit: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'price_asc') {
      orderBy = { basePrice: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { basePrice: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          brand: true,
          category: true,
          variants: { orderBy: { price: 'asc' } },
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        },
      }),
    ]);

    return NextResponse.json({
      items: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('Error fetching products:', err);
    return NextResponse.json({ items: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  }
}
