import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req, ['ADMIN', 'MANAGER']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const { id } = params;
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ message: 'Banner oʻchirildi' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req, ['ADMIN', 'MANAGER']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(body.titleUz ? { titleUz: body.titleUz } : {}),
        ...(body.titleRu ? { titleRu: body.titleRu } : {}),
        ...(body.subtitleUz !== undefined ? { subtitleUz: body.subtitleUz } : {}),
        ...(body.subtitleRu !== undefined ? { subtitleRu: body.subtitleRu } : {}),
        ...(body.badgeUz !== undefined ? { badgeUz: body.badgeUz } : {}),
        ...(body.badgeRu !== undefined ? { badgeRu: body.badgeRu } : {}),
        ...(body.linkUrl ? { linkUrl: body.linkUrl } : {}),
        ...(body.imageUrlDesktop ? { imageUrlDesktop: body.imageUrlDesktop } : {}),
        ...(body.imageUrlMobile ? { imageUrlMobile: body.imageUrlMobile } : {}),
        ...(body.order !== undefined ? { order: parseInt(body.order, 10) } : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      },
    });

    return NextResponse.json(banner);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
