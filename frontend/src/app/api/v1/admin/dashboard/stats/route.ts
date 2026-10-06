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

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalApps,
      todayApps,
      weekApps,
      approvedApps,
      inReviewApps,
      totalProducts,
      recentApplications,
      topProducts,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { createdAt: { gte: today } } }),
      prisma.application.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'IN_REVIEW' } }),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.application.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { select: { nameUz: true, nameRu: true } },
            },
          },
        },
      }),
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

    const conversionRate =
      totalApps > 0 ? Number(((approvedApps / totalApps) * 100).toFixed(1)) : 0;

    const metrics = {
      totalApplications: totalApps,
      todayApplications: todayApps,
      weekApplications: weekApps,
      approvedApplications: approvedApps,
      conversionRate,
      totalProducts,
    };

    return NextResponse.json({
      metrics,
      recentApplications,
      applications: {
        total: totalApps,
        today: todayApps,
        approved: approvedApps,
        inReview: inReviewApps,
        conversionRate,
      },
      topProducts,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
