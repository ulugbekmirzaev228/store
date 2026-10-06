import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

function formatDueDate(monthsAhead: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const numPrice = parseFloat(body.price);
    const numMonths = parseInt(body.termMonths ?? body.months ?? 12, 10);
    const numDownPct = parseFloat(body.downPaymentPercent ?? 0);
    const customMarkup =
      body.customMarkupPercent !== undefined && body.customMarkupPercent !== null
        ? parseFloat(body.customMarkupPercent)
        : undefined;

    if (!numPrice || numPrice <= 0 || !numMonths) {
      return NextResponse.json({ message: 'Notoʻgʻri parametrlar' }, { status: 400 });
    }

    // Default markup rates (Standard retail financing in UZ)
    const defaultRates: Record<number, number> = {
      3: 0,
      6: 12,
      9: 18,
      12: 24,
    };

    let markupPercent = customMarkup !== undefined ? customMarkup : (defaultRates[numMonths] ?? 24);

    // If customMarkup is not explicitly passed, check DB installment plan
    if (customMarkup === undefined) {
      try {
        const plan = await prisma.installmentPlan.findUnique({
          where: { months: numMonths },
        });
        if (plan) {
          markupPercent = plan.markupPercent;
        }
      } catch (_) {}
    }

    // Check product override if productId is supplied
    if (body.productId && customMarkup === undefined) {
      try {
        const prod = await prisma.product.findUnique({ where: { id: body.productId } });
        if (prod?.customMarkupPercent !== null && prod?.customMarkupPercent !== undefined) {
          markupPercent = prod.customMarkupPercent;
        }
      } catch (_) {}
    }

    let downPaymentAmount = 0;
    if (body.downPaymentAmount !== undefined && body.downPaymentAmount !== null) {
      downPaymentAmount = Math.max(0, Math.min(numPrice * 0.7, parseFloat(body.downPaymentAmount)));
    } else {
      downPaymentAmount = Math.round((numPrice * Math.min(70, Math.max(0, numDownPct))) / 100);
    }

    const remainingCashPrice = numPrice - downPaymentAmount;
    const overpayment = Math.round((remainingCashPrice * markupPercent) / 100);
    const loanAmount = remainingCashPrice + overpayment;
    const monthlyPayment = Math.round(loanAmount / numMonths);
    const totalPrice = downPaymentAmount + loanAmount;

    // Schedule
    const schedule = [];
    for (let i = 1; i <= numMonths; i++) {
      const dueDate = formatDueDate(i);
      schedule.push({
        month: i,
        monthIndex: i,
        dueDate,
        paymentDate: dueDate,
        amount: monthlyPayment,
      });
    }

    return NextResponse.json({
      price: numPrice,
      cashPrice: numPrice,
      termMonths: numMonths,
      months: numMonths,
      downPaymentPercent: numDownPct,
      downPaymentAmount,
      downPayment: downPaymentAmount,
      markupPercent,
      overpayment,
      loanAmount,
      monthlyPayment,
      totalPrice,
      schedule,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}
