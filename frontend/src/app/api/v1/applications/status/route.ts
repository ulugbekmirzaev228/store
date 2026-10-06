import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const applicationNumber = searchParams.get('applicationNumber');

    if (!phone && !applicationNumber) {
      return NextResponse.json({ message: 'Telefon raqam yoki ariza raqami kiritilishi shart' }, { status: 400 });
    }

    const where: any = {};
    if (applicationNumber) {
      where.applicationNumber = applicationNumber.trim().toUpperCase();
    }
    if (phone) {
      const raw = phone.trim();
      const digits = raw.replace(/\D/g, '');
      const last7 = digits.length >= 7 ? digits.slice(-7) : digits;
      where.OR = [
        { phone: { contains: raw } },
        { phone: { contains: digits } },
        ...(last7 ? [{ phone: { contains: last7 } }] : []),
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        items: { include: { product: true, variant: true } },
        statusLogs: { orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json(applications);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Xatolik' }, { status: 500 });
  }
}
