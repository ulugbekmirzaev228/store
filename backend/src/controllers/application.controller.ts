import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { InstallmentService } from '../services/installment.service.js';
import { sendTelegramApplicationAlert } from '../utils/telegram.js';

const createApplicationSchema = z.object({
  customerName: z.string().min(2, 'Ism-sharifingizni toʻliq kiriting'),
  phone: z.string().min(9, 'Telefon raqam notoʻgʻri kiritildi'),
  district: z.string().min(2, 'Tumanni tanlang'),
  address: z.string().min(3, 'Manzilni toʻliq kiriting'),
  passportSeries: z.string().optional(),
  preferredContactTime: z.string().optional(),
  deliveryMethod: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
  branchId: z.string().optional(),
  consentAgreed: z.boolean().refine(val => val === true, {
    message: 'Shartlar va qoidalarga rozilik bildirish majburiy',
  }),
  productId: z.string().min(1, 'Mahsulot tanlanmagan'),
  variantId: z.string().min(1, 'Mahsulot varianti tanlanmagan'),
  termMonths: z.number().int().refine(val => [3, 6, 9, 12].includes(val), {
    message: 'Nasiya muddati 3, 6, 9 yoki 12 oy boʻlishi kerak',
  }),
  downPaymentAmount: z.number().min(0).optional(),
  downPaymentPercent: z.number().min(0).max(70).optional(),
});

export class ApplicationController {
  /**
   * Submit online installment application
   */
  static async submitApplication(req: Request, res: Response) {
    const data = createApplicationSchema.parse(req.body);

    // 1. Fetch product and variant
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        variants: true,
      },
    });

    if (!product || !product.isPublished) {
      return res.status(404).json({ message: 'Tanlangan mahsulot mavjud emas' });
    }

    const variant = product.variants.find(v => v.id === data.variantId);
    if (!variant) {
      return res.status(404).json({ message: 'Tanlangan mahsulot varianti topilmadi' });
    }

    // 2. Perform exact installment calculation
    const calc = await InstallmentService.calculate({
      price: variant.price,
      termMonths: data.termMonths,
      downPaymentAmount: data.downPaymentAmount,
      downPaymentPercent: data.downPaymentPercent,
      customMarkupPercent: product.customMarkupPercent || undefined,
    });

    // 3. Generate unique application number (NG-YYYY-XXXX)
    const year = new Date().getFullYear();
    const count = await prisma.application.count();
    const sequence = (1001 + count).toString().padStart(4, '0');
    const applicationNumber = `NG-${year}-${sequence}`;

    // Clean phone number: ensure +998 format
    let cleanPhone = data.phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('998')) {
        cleanPhone = '+' + cleanPhone;
      } else {
        cleanPhone = '+998' + cleanPhone;
      }
    }

    // 4. Save application and order item in transaction
    const application = await prisma.application.create({
      data: {
        applicationNumber,
        customerName: data.customerName,
        phone: cleanPhone,
        district: data.district,
        address: data.address,
        passportSeries: data.passportSeries || null,
        preferredContactTime: data.preferredContactTime || null,
        deliveryMethod: data.deliveryMethod,
        branchId: data.branchId || null,
        status: 'NEW',
        totalPrice: calc.totalPrice,
        downPayment: calc.downPaymentAmount,
        loanAmount: calc.loanAmount,
        termMonths: data.termMonths,
        monthlyPayment: calc.monthlyPayment,
        markupPercent: calc.markupPercent,
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            quantity: 1,
            unitPrice: variant.price,
          },
        },
        statusLogs: {
          create: {
            newStatus: 'NEW',
            comment: 'Mijoz sayt orqali ariza topshirdi',
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    // 5. Asynchronously trigger Telegram alert to managers
    const variantDesc = `${variant.colorUz}, ${variant.memoryRom || ''} ${variant.memoryRam ? `(${variant.memoryRam})` : ''}`.trim();
    sendTelegramApplicationAlert({
      applicationNumber,
      customerName: data.customerName,
      phone: cleanPhone,
      district: data.district,
      address: data.address,
      productName: product.nameUz,
      variantDetails: variantDesc,
      termMonths: data.termMonths,
      totalPrice: calc.totalPrice,
      downPayment: calc.downPaymentAmount,
      monthlyPayment: calc.monthlyPayment,
    }).catch(err => console.error('Telegram alert failed:', err));

    res.status(201).json({
      success: true,
      applicationNumber,
      messageUz: 'Arizangiz muvaffaqiyatli qabul qilindi! Tez orada mutaxassisimiz siz bilan bogʻlanadi.',
      messageRu: 'Ваша заявка успешно принята! Наш специалист свяжется с вами в ближайшее время.',
      data: {
        applicationNumber,
        monthlyPayment: calc.monthlyPayment,
        termMonths: data.termMonths,
        totalPrice: calc.totalPrice,
      },
    });
  }

  /**
   * Check application status by phone and application number (public-safe)
   */
  static async getStatus(req: Request, res: Response) {
    const { phone, applicationNumber } = req.query;

    if (!phone || !applicationNumber) {
      return res.status(400).json({ message: 'Telefon raqami va ariza raqami kiritilishi shart' });
    }

    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    const cleanAppNum = String(applicationNumber).trim().toUpperCase();

    const application = await prisma.application.findFirst({
      where: {
        applicationNumber: cleanAppNum,
        phone: { contains: cleanPhone.slice(-9) }, // Matches last 9 digits
      },
      include: {
        items: {
          include: {
            product: { select: { nameUz: true, nameRu: true, slug: true } },
            variant: { select: { colorUz: true, colorRu: true, memoryRom: true } },
          },
        },
        statusLogs: {
          select: { newStatus: true, createdAt: true, comment: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Kiritilgan maʼlumotlar boʻyicha ariza topilmadi' });
    }

    // Mask customer name for privacy (e.g., "S***** R******")
    const maskedName = application.customerName
      .split(' ')
      .map(part => part.charAt(0) + '*'.repeat(Math.max(1, part.length - 1)))
      .join(' ');

    res.json({
      applicationNumber: application.applicationNumber,
      customerName: maskedName,
      status: application.status,
      deliveryMethod: application.deliveryMethod,
      district: application.district,
      totalPrice: application.totalPrice,
      downPayment: application.downPayment,
      monthlyPayment: application.monthlyPayment,
      termMonths: application.termMonths,
      createdAt: application.createdAt,
      items: application.items.map(i => ({
        productNameUz: i.product.nameUz,
        productNameRu: i.product.nameRu,
        variantColorUz: i.variant.colorUz,
        variantColorRu: i.variant.colorRu,
        memoryRom: i.variant.memoryRom,
      })),
      history: application.statusLogs.map(log => ({
        status: log.newStatus,
        date: log.createdAt,
        comment: log.comment,
      })),
    });
  }
}
