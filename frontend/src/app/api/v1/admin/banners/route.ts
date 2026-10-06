import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(banners);
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
      titleUz,
      titleRu,
      subtitleUz,
      subtitleRu,
      badgeUz,
      badgeRu,
      linkUrl = '/catalog',
      imageUrlDesktop,
      imageUrlMobile,
      order = 0,
      isActive = true,
    } = body;

    const banner = await prisma.banner.create({
      data: {
        titleUz,
        titleRu: titleRu || titleUz,
        subtitleUz,
        subtitleRu,
        badgeUz,
        badgeRu,
        linkUrl,
        imageUrlDesktop,
        imageUrlMobile: imageUrlMobile || imageUrlDesktop,
        order: parseInt(order, 10) || 0,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
