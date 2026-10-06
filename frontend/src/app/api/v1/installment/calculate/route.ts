import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { price, months, downPaymentPercent = 0, productId } = body;

    const numPrice = parseFloat(price);
    const numMonths = parseInt(months, 10);
    const numDownPct = parseFloat(downPaymentPercent) || 0;

    if (!numPrice || numPrice <= 0 || !numMonths) {
      return NextResponse.json({ message: 'Notoʻgʻri parametrlar' }, { status: 400 });
    }

    // Default markup rates
    const defaultRates: Record<number, number> = {
      3: 0,
      6: 12,
      9: 18,
      12: 24,
    };

    let markupPercent = defaultRates[numMonths] ?? 24;

    // Check DB installment plan
    try {
      const plan = await prisma.installmentPlan.findUnique({
        where: { months: numMonths },
      });
      if (plan) markupPercent = plan.markupPercent;
    } catch (_) {}

    // Check product override
    if (productId) {
      try {
        const prod = await prisma.product.findUnique({ where: { id: productId } });
        if (prod?.customMarkupPercent !== null && prod?.customMarkupPercent !== undefined) {
          markupPercent = prod.customMarkupPercent;
        }
      } catch (_) {}
    }

    const downPayment = Math.round((numPrice * numDownPct) / 100);
    const remainingCashPrice = numPrice - downPayment;
    const overpayment = Math.round((remainingCashPrice * markupPercent) / 100);
    const loanAmount = remainingCashPrice + overpayment;
    const monthlyPayment = Math.round(loanAmount / numMonths);
    const totalPrice = downPayment + loanAmount;

    // Schedule
    const schedule = [];
    const now = new Date();
    for (let i = 1; i <= numMonths; i++) {
      const payDate = new Date(now.getFullYear(), now.getMonth() + i, now.getDate());
      schedule.push({
        monthIndex: i,
        paymentDate: payDate.toISOString().substring(0, 10),
        amount: monthlyPayment,
      });
    }

    return NextResponse.json({
      price: numPrice,
      months: numMonths,
      downPaymentPercent: numDownPct,
      downPayment,
      markupPercent,
      overpayment,
      loanAmount,
      monthlyPayment,
      totalPrice,
      schedule,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Xatolik' }, { status: 500 });
  }
}
