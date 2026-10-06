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
      downPaymentAmount,
      totalPrice,
      loanAmount,
      monthlyPayment,
    } = body;

    if (!customerName || !phone) {
      return NextResponse.json({ message: 'Ism va telefon raqami kiritilishi shart' }, { status: 400 });
    }

    // 1. Resolve Product and Variant safely
    let resolvedVariant: any = null;
    let resolvedProduct: any = null;

    if (variantId) {
      resolvedVariant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });
    }

    if (!resolvedVariant && (productId || variantId)) {
      resolvedVariant = await prisma.productVariant.findFirst({
        where: {
          OR: [
            { productId: productId || variantId },
            { id: productId },
          ],
        },
        orderBy: { isDefault: 'desc' },
      });
    }

    const prodIdToFind = productId || resolvedVariant?.productId;
    if (prodIdToFind) {
      resolvedProduct = await prisma.product.findUnique({
        where: { id: prodIdToFind },
      });
    }

    if (!resolvedProduct && resolvedVariant?.productId) {
      resolvedProduct = await prisma.product.findUnique({
        where: { id: resolvedVariant.productId },
      });
    }

    if (!resolvedProduct) {
      // Fallback: pick the first available product in DB
      resolvedProduct = await prisma.product.findFirst();
    }

    if (!resolvedProduct) {
      return NextResponse.json({ message: 'Mahsulot bazada topilmadi' }, { status: 404 });
    }

    if (!resolvedVariant) {
      // Find or create default variant
      resolvedVariant = await prisma.productVariant.findFirst({
        where: { productId: resolvedProduct.id },
      });

      if (!resolvedVariant) {
        resolvedVariant = await prisma.productVariant.create({
          data: {
            productId: resolvedProduct.id,
            sku: `${resolvedProduct.slug || 'SKU'}-${Date.now()}`,
            colorUz: 'Standart',
            colorRu: 'Стандарт',
            colorCode: '#000000',
            price: resolvedProduct.basePrice || 1000000,
            isDefault: true,
            stock: 10,
          },
        });
      }
    }

    // 2. Safe financial calculations
    const term = parseInt(termMonths, 10) || 12;
    const downPay = parseFloat(downPayment ?? downPaymentAmount) || 0;
    const basePrice = resolvedVariant?.price || resolvedProduct?.basePrice || 0;

    const markupRates: Record<number, number> = {
      3: 0,
      6: 0.12,
      9: 0.18,
      12: 0.24,
      24: 0.40,
    };
    const rate = markupRates[term] ?? (term <= 3 ? 0 : term <= 6 ? 0.12 : term <= 9 ? 0.18 : 0.24);

    let numTotalPrice = parseFloat(totalPrice);
    let numLoanAmount = parseFloat(loanAmount);
    let numMonthlyPayment = parseFloat(monthlyPayment);

    if (isNaN(numTotalPrice) || numTotalPrice <= 0) {
      const principal = Math.max(0, basePrice - downPay);
      const markup = Math.round(principal * rate);
      numLoanAmount = principal + markup;
      numTotalPrice = downPay + numLoanAmount;
      numMonthlyPayment = Math.round(numLoanAmount / term);
    } else {
      if (isNaN(numLoanAmount) || numLoanAmount <= 0) {
        numLoanAmount = Math.max(0, numTotalPrice - downPay);
      }
      if (isNaN(numMonthlyPayment) || numMonthlyPayment <= 0) {
        numMonthlyPayment = Math.round(numLoanAmount / term);
      }
    }

    // 3. Resolve Branch
    let branchConnect: { connect: { id: string } } | undefined = undefined;
    if (deliveryMethod === 'PICKUP') {
      if (branchId) {
        const foundBranch = await prisma.branch.findUnique({ where: { id: branchId } });
        if (foundBranch) {
          branchConnect = { connect: { id: foundBranch.id } };
        }
      }
      if (!branchConnect) {
        const firstBranch = await prisma.branch.findFirst({ where: { isActive: true } });
        if (firstBranch) {
          branchConnect = { connect: { id: firstBranch.id } };
        }
      }
    }

    const applicationNumber = `NG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const application = await prisma.application.create({
      data: {
        applicationNumber,
        customerName: customerName.trim(),
        phone: phone.trim(),
        district: district || (deliveryMethod === 'PICKUP' ? 'Toshkent shahri' : 'Chilonzor tumani'),
        address: address?.trim() || (deliveryMethod === 'PICKUP' ? 'Doʻkondan olib ketish' : 'Manzil koʻrsatilmagan'),
        passportSeries: passportSeries?.trim() || null,
        preferredContactTime: preferredContactTime || '10:00 - 13:00',
        comment: comment || null,
        deliveryMethod,
        ...(branchConnect ? { branch: branchConnect } : {}),
        termMonths: term,
        downPayment: downPay,
        totalPrice: numTotalPrice,
        loanAmount: numLoanAmount,
        monthlyPayment: numMonthlyPayment,
        status: 'NEW',
        items: {
          create: [
            {
              productId: resolvedProduct.id,
              variantId: resolvedVariant.id,
              quantity: 1,
              unitPrice: basePrice || numTotalPrice,
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
        branch: true,
      },
    });

    return NextResponse.json({
      ...application,
      success: true,
      messageUz: 'Arizangiz muvaffaqiyatli qabul qilindi. Tez orada menejerimiz siz bilan bogʻlanadi!',
      messageRu: 'Ваша заявка успешно принята. Наш менеджер свяжется с вами в ближайшее время!',
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating application:', err);
    return NextResponse.json({ message: err.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}
