import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAdminToken(req);
  if (!auth) {
    return NextResponse.json({ message: 'Avtorizatsiyadan oʻtilmagan' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalApps, todayApps, approvedApps, inReviewApps, topProducts] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { createdAt: { gte: today } } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'IN_REVIEW' } }),
      prisma.product.findMany({
        take: 5,
        orderBy: { basePrice: 'desc' },
        include: {
          brand: true,
          images: { take: 1 },
          variants: true,
        },
      }),
    ]);

    return NextResponse.json({
      applications: {
        total: totalApps,
        today: todayApps,
        approved: approvedApps,
        inReview: inReviewApps,
        conversionRate: totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0,
      },
      topProducts,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
