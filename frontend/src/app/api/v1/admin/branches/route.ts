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
    const branches = await prisma.branch.findMany();
    return NextResponse.json(branches);
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
    const { nameUz, nameRu, addressUz, addressRu, workingHours, phone, latitude, longitude } = body;

    const branch = await prisma.branch.create({
      data: {
        nameUz,
        nameRu: nameRu || nameUz,
        addressUz,
        addressRu: addressRu || addressUz,
        workingHours: workingHours || '09:00 - 21:00',
        phone: phone || '+998 71 200 44 00',
        latitude: parseFloat(latitude) || 41.2995,
        longitude: parseFloat(longitude) || 69.2401,
        isActive: true,
      },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
