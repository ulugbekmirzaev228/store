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
    const plans = await prisma.installmentPlan.findMany({
      orderBy: { months: 'asc' },
    });
    return NextResponse.json(plans);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
