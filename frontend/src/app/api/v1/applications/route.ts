import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      district,
      address,
      passportSeries,
      preferredContactTime,
      comment,
      deliveryMethod = 'DELIVERY',
      branchId,
      productId,
      variantId,
      termMonths,
      downPayment,
      totalPrice,
      loanAmount,
      monthlyPayment,
    } = body;

    if (!customerName || !phone || !district || !productId || !variantId || !termMonths) {
      return NextResponse.json({ message: 'Majburiy maydonlar toʻldirilmagan' }, { status: 400 });
    }

    const applicationNumber = `NG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const application = await prisma.application.create({
      data: {
        applicationNumber,
        customerName,
        phone,
        district,
        address: address || 'Manzil koʻrsatilmagan',
        passportSeries,
        preferredContactTime,
        comment,
        deliveryMethod,
        branchId: branchId || null,
        termMonths: parseInt(termMonths, 10),
        downPayment: parseFloat(downPayment) || 0,
        totalPrice: parseFloat(totalPrice),
        loanAmount: parseFloat(loanAmount),
        monthlyPayment: parseFloat(monthlyPayment),
        status: 'NEW',
        items: {
          create: [
            {
              productId,
              variantId,
              quantity: 1,
              unitPrice: parseFloat(totalPrice),
            },
          ],
        },
        statusLogs: {
          create: [
            {
              newStatus: 'NEW',
              comment: 'Ariza mijoz tomonidan sayt orqali yuborildi',
            },
          ],
        },
      },
      include: {
        items: { include: { product: true, variant: true } },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (err: any) {
    console.error('Error creating application:', err);
    return NextResponse.json({ message: err.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}
