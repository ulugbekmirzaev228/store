import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req, ['ADMIN']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { nameUz, nameRu, addressUz, addressRu, workingHours, phone, latitude, longitude, isActive } = body;

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        ...(nameUz ? { nameUz } : {}),
        ...(nameRu ? { nameRu } : {}),
        ...(addressUz ? { addressUz } : {}),
        ...(addressRu ? { addressRu } : {}),
        ...(workingHours ? { workingHours } : {}),
        ...(phone ? { phone } : {}),
        ...(latitude !== undefined ? { latitude: parseFloat(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: parseFloat(longitude) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json(branch);
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
    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ message: 'Filial oʻchirildi' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
