import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAdminToken(req);
  if (!auth) {
    return NextResponse.json({ message: 'Avtorizatsiyadan oʻtilmagan' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const brandId = searchParams.get('brandId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (brandId) where.brandId = brandId;
    if (search) {
      const q = search.trim();
      where.OR = [
        { nameUz: { contains: q, mode: 'insensitive' } },
        { nameRu: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          category: true,
          variants: true,
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        },
      }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminToken(req, ['ADMIN', 'MANAGER']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      nameUz,
      nameRu,
      brandId,
      categoryId,
      basePrice,
      descriptionUz,
      descriptionRu,
      isHit = false,
      isNew = false,
      isPublished = true,
      customMarkupPercent,
      variants = [],
      images = [],
    } = body;

    const slug = nameUz.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    const created = await prisma.product.create({
      data: {
        nameUz,
        nameRu: nameRu || nameUz,
        slug,
        brandId,
        categoryId,
        basePrice: parseFloat(basePrice),
        descriptionUz: descriptionUz || nameUz,
        descriptionRu: descriptionRu || nameRu || nameUz,
        isHit: Boolean(isHit),
        isNew: Boolean(isNew),
        isPublished: Boolean(isPublished),
        customMarkupPercent: customMarkupPercent ? parseFloat(customMarkupPercent) : null,
        variants: {
          create: variants.map((v: any, index: number) => ({
            sku: v.sku || `SKU-${Date.now()}-${index}`,
            colorUz: v.colorUz || 'Standart',
            colorRu: v.colorRu || v.colorUz || 'Стандарт',
            colorCode: v.colorCode || '#25282A',
            memoryRom: v.memoryRom,
            memoryRam: v.memoryRam,
            price: parseFloat(v.price || basePrice),
            stock: parseInt(v.stock, 10) || 0,
            isDefault: index === 0,
          })),
        },
        images: {
          create: images.map((img: any, index: number) => ({
            imageUrl: typeof img === 'string' ? img : img.imageUrl,
            isPrimary: index === 0,
            order: index,
          })),
        },
      },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
