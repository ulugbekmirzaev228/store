import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req, ['ADMIN']);
  if (!auth) {
    return NextResponse.json({ message: 'Faqat bosh admin oʻzgartira oladi' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { markupPercent, minDownPaymentPercent, maxDownPaymentPercent, isActive } = body;

    const plan = await prisma.installmentPlan.update({
      where: { id },
      data: {
        ...(markupPercent !== undefined ? { markupPercent: parseFloat(markupPercent) } : {}),
        ...(minDownPaymentPercent !== undefined
          ? { minDownPaymentPercent: parseFloat(minDownPaymentPercent) }
          : {}),
        ...(maxDownPaymentPercent !== undefined
          ? { maxDownPaymentPercent: parseFloat(maxDownPaymentPercent) }
          : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json(plan);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
