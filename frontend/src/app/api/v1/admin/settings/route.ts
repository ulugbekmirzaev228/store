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
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    return NextResponse.json(settingsMap);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = verifyAdminToken(req, ['ADMIN']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const updates = await req.json();
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    return NextResponse.json(settingsMap);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
