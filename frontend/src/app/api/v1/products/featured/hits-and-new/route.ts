import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [hits, newArrivals] = await Promise.all([
      prisma.product.findMany({
        where: { isPublished: true, isHit: true },
        take: 8,
        orderBy: { basePrice: 'desc' },
        include: {
          brand: true,
          category: true,
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
          variants: { orderBy: [{ isDefault: 'desc' }, { price: 'asc' }] },
        },
      }),
      prisma.product.findMany({
        where: { isPublished: true, isNew: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          category: true,
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
          variants: { orderBy: [{ isDefault: 'desc' }, { price: 'asc' }] },
        },
      }),
    ]);

    // Fallbacks if hits or newArrivals are empty
    let finalHits = hits;
    if (finalHits.length === 0) {
      finalHits = await prisma.product.findMany({
        where: { isPublished: true },
        take: 8,
        orderBy: { basePrice: 'desc' },
        include: {
          brand: true,
          category: true,
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
          variants: { orderBy: [{ isDefault: 'desc' }, { price: 'asc' }] },
        },
      });
    }

    let finalNew = newArrivals;
    if (finalNew.length === 0) {
      finalNew = await prisma.product.findMany({
        where: { isPublished: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          category: true,
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
          variants: { orderBy: [{ isDefault: 'desc' }, { price: 'asc' }] },
        },
      });
    }

    const formatProduct = (p: any) => ({
      id: p.id,
      nameUz: p.nameUz,
      nameRu: p.nameRu,
      slug: p.slug,
      basePrice: p.basePrice,
      isHit: p.isHit,
      isNew: p.isNew,
      brand: p.brand,
      category: p.category,
      images: p.images,
      primaryImage: p.images?.[0]?.imageUrl || null,
      secondaryImage: p.images?.[1]?.imageUrl || null,
      minMonthlyPayment: Math.round(((p.variants?.[0]?.price || p.basePrice) * 1.24) / 12),
    });

    return NextResponse.json({
      hits: finalHits.map(formatProduct),
      newArrivals: finalNew.map(formatProduct),
    });
  } catch (err: any) {
    console.error('Featured hits and new error:', err);
    return NextResponse.json({ hits: [], newArrivals: [] });
  }
}
