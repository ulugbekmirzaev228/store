import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req, ['ADMIN', 'MANAGER']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const {
      nameUz,
      nameRu,
      brandId,
      categoryId,
      basePrice,
      descriptionUz,
      descriptionRu,
      isHit,
      isNew,
      isPublished,
      customMarkupPercent,
      imageUrl,
      colorUz,
      memoryRom,
      memoryRam,
      stock,
    } = body;

    await prisma.product.update({
      where: { id },
      data: {
        ...(nameUz ? { nameUz } : {}),
        ...(nameRu ? { nameRu } : {}),
        ...(brandId ? { brandId } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(basePrice !== undefined ? { basePrice: parseFloat(basePrice) } : {}),
        ...(descriptionUz ? { descriptionUz } : {}),
        ...(descriptionRu ? { descriptionRu } : {}),
        ...(isHit !== undefined ? { isHit: Boolean(isHit) } : {}),
        ...(isNew !== undefined ? { isNew: Boolean(isNew) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
        ...(customMarkupPercent !== undefined
          ? { customMarkupPercent: customMarkupPercent ? parseFloat(customMarkupPercent) : null }
          : {}),
      },
    });

    if (imageUrl !== undefined && imageUrl.trim()) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.create({
        data: {
          productId: id,
          imageUrl: imageUrl.trim(),
          isPrimary: true,
          order: 0,
        },
      });
    }

    if (stock !== undefined || colorUz !== undefined || memoryRom !== undefined) {
      const defaultVariant = await prisma.productVariant.findFirst({
        where: { productId: id },
        orderBy: { isDefault: 'desc' },
      });
      if (defaultVariant) {
        await prisma.productVariant.update({
          where: { id: defaultVariant.id },
          data: {
            ...(stock !== undefined ? { stock: parseInt(stock, 10) } : {}),
            ...(colorUz ? { colorUz } : {}),
            ...(memoryRom !== undefined ? { memoryRom } : {}),
            ...(memoryRam !== undefined ? { memoryRam } : {}),
            ...(basePrice !== undefined ? { price: parseFloat(basePrice) } : {}),
          },
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: true,
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
    return NextResponse.json({ message: 'Faqat bosh admin oʻchira oladi' }, { status: 403 });
  }

  try {
    const { id } = params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Mahsulot oʻchirildi' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
