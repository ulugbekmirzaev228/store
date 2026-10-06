import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../types/index.js';
import * as XLSX from 'xlsx';

export class AdminController {
  // ===================== 1. DASHBOARD ANALYTICS =====================
  static async getDashboardStats(req: Request, res: Response) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalApplications,
      todayApplications,
      weekApplications,
      approvedApplications,
      deliveredApplications,
      totalProducts,
      statusCounts,
      recentApplications,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { createdAt: { gte: today } } }),
      prisma.application.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'DELIVERED' } }),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.application.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.application.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { select: { nameUz: true, nameRu: true } },
            },
          },
          assignedManager: { select: { name: true } },
        },
      }),
    ]);

    const conversionRate = totalApplications > 0
      ? Number((((approvedApplications + deliveredApplications) / totalApplications) * 100).toFixed(1))
      : 0;

    res.json({
      metrics: {
        totalApplications,
        todayApplications,
        weekApplications,
        approvedApplications,
        deliveredApplications,
        conversionRate,
        totalProducts,
      },
      statusBreakdown: statusCounts.reduce((acc: any, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {}),
      recentApplications,
    });
  }

  // ===================== 2. APPLICATIONS MANAGEMENT =====================
  static async getApplications(req: Request, res: Response) {
    const {
      status,
      search,
      managerId,
      district,
      page = '1',
      limit = '15',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 15));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (managerId) {
      where.assignedManagerId = String(managerId);
    }

    if (district) {
      where.district = { contains: String(district) };
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { applicationNumber: { contains: q } },
        { customerName: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [total, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedManager: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, nameUz: true, nameRu: true } },
              variant: { select: { id: true, colorUz: true, colorRu: true, memoryRom: true } },
            },
          },
        },
      }),
    ]);

    res.json({
      items: applications,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  }

  static async updateApplication(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status, assignedManagerId, internalNotes, comment } = req.body;

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Ariza topilmadi' });
    }

    const updateData: any = {};
    if (status && status !== existing.status) updateData.status = status;
    if (assignedManagerId !== undefined) updateData.assignedManagerId = assignedManagerId;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: updateData,
        include: {
          assignedManager: { select: { id: true, name: true } },
          items: { include: { product: true, variant: true } },
        },
      });

      if (status && status !== existing.status) {
        await tx.applicationStatusLog.create({
          data: {
            applicationId: id,
            oldStatus: existing.status,
            newStatus: status,
            changedById: req.user?.id || null,
            comment: comment || `Status oʻzgartirildi: ${existing.status} -> ${status}`,
          },
        });
      }

      return app;
    });

    res.json(updated);
  }

  static async exportApplicationsToExcel(req: Request, res: Response) {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignedManager: true,
        items: {
          include: { product: true, variant: true },
        },
      },
    });

    const rows = applications.map(app => ({
      'Ariza raqami': app.applicationNumber,
      'Mijoz': app.customerName,
      'Telefon': app.phone,
      'Tuman': app.district,
      'Manzil': app.address,
      'Pasport seriyasi': app.passportSeries || '-',
      'Holat': app.status,
      'Mahsulot': app.items.map(i => `${i.product.nameUz} (${i.variant.colorUz}, ${i.variant.memoryRom || ''})`).join('; '),
      'Jami narx': app.totalPrice,
      'Boshlangʻich toʻlov': app.downPayment,
      'Nasiya summasi': app.loanAmount,
      'Muddat (oy)': app.termMonths,
      'Oylik toʻlov': app.monthlyPayment,
      'Menejer': app.assignedManager?.name || 'Biriktirilmagan',
      'Yaratilgan vaqt': app.createdAt.toISOString().replace('T', ' ').substring(0, 19),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Arizalar');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=nasiyago-arizalar-${Date.now()}.xlsx`);
    res.send(buffer);
  }

  // ===================== 3. PRODUCTS CRUD =====================
  static async getProducts(req: Request, res: Response) {
    const { search, brandId, categoryId, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (brandId) where.brandId = String(brandId);
    if (categoryId) where.categoryId = String(categoryId);
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { nameUz: { contains: q } },
        { nameRu: { contains: q } },
        { slug: { contains: q } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          category: true,
          variants: true,
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        },
      }),
    ]);

    res.json({
      items: products,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  }

  static async createProduct(req: Request, res: Response) {
    const {
      nameUz,
      nameRu,
      slug,
      brandId,
      categoryId,
      basePrice,
      descriptionUz,
      descriptionRu,
      isHit = false,
      isNew = false,
      isPublished = true,
      customMarkupPercent,
      variants = [],
      images = [],
      specs = [],
    } = req.body;

    const created = await prisma.product.create({
      data: {
        nameUz,
        nameRu,
        slug: slug || nameUz.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brandId,
        categoryId,
        basePrice: parseFloat(basePrice),
        descriptionUz,
        descriptionRu,
        isHit: Boolean(isHit),
        isNew: Boolean(isNew),
        isPublished: Boolean(isPublished),
        customMarkupPercent: customMarkupPercent ? parseFloat(customMarkupPercent) : null,
        variants: {
          create: variants.map((v: any, index: number) => ({
            sku: v.sku || `SKU-${Date.now()}-${index}`,
            colorUz: v.colorUz,
            colorRu: v.colorRu,
            colorCode: v.colorCode || '#000000',
            memoryRam: v.memoryRam,
            memoryRom: v.memoryRom,
            condition: v.condition || 'NEW',
            price: parseFloat(v.price),
            oldPrice: v.oldPrice ? parseFloat(v.oldPrice) : null,
            stock: parseInt(v.stock, 10) || 0,
            isDefault: index === 0,
          })),
        },
        images: {
          create: images.map((img: any, index: number) => ({
            imageUrl: typeof img === 'string' ? img : img.imageUrl,
            isPrimary: index === 0,
            order: index,
          })),
        },
        specs: {
          create: specs.map((s: any, index: number) => ({
            groupUz: s.groupUz,
            groupRu: s.groupRu,
            labelUz: s.labelUz,
            labelRu: s.labelRu,
            valueUz: s.valueUz,
            valueRu: s.valueRu,
            order: index,
          })),
        },
      },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: true,
        specs: true,
      },
    });

    res.status(201).json(created);
  }

  static async updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const {
      nameUz,
      nameRu,
      slug,
      brandId,
      categoryId,
      basePrice,
      descriptionUz,
      descriptionRu,
      isHit,
      isNew,
      isPublished,
      customMarkupPercent,
      variants,
      images,
      imageUrl,
      stock,
      colorUz,
      colorRu,
      memoryRom,
      memoryRam,
    } = req.body;

    // 1. Update product main info
    await prisma.product.update({
      where: { id },
      data: {
        ...(nameUz ? { nameUz } : {}),
        ...(nameRu ? { nameRu } : {}),
        ...(slug ? { slug } : {}),
        ...(brandId ? { brandId } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(basePrice !== undefined ? { basePrice: parseFloat(basePrice) } : {}),
        ...(descriptionUz ? { descriptionUz } : {}),
        ...(descriptionRu ? { descriptionRu } : {}),
        ...(isHit !== undefined ? { isHit: Boolean(isHit) } : {}),
        ...(isNew !== undefined ? { isNew: Boolean(isNew) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
        ...(customMarkupPercent !== undefined ? { customMarkupPercent: customMarkupPercent ? parseFloat(customMarkupPercent) : null } : {}),
      },
    });

    // 2. Update images if supplied
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: any, index: number) => ({
            productId: id,
            imageUrl: typeof img === 'string' ? img : img.imageUrl,
            isPrimary: index === 0,
            order: index,
          })),
        });
      }
    } else if (imageUrl !== undefined && imageUrl.trim()) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.create({
        data: {
          productId: id,
          imageUrl: imageUrl.trim(),
          isPrimary: true,
          order: 0,
        },
      });
    }

    // 3. Update variants if supplied
    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              ...(v.colorUz ? { colorUz: v.colorUz } : {}),
              ...(v.colorRu ? { colorRu: v.colorRu } : {}),
              ...(v.colorCode ? { colorCode: v.colorCode } : {}),
              ...(v.memoryRom !== undefined ? { memoryRom: v.memoryRom } : {}),
              ...(v.memoryRam !== undefined ? { memoryRam: v.memoryRam } : {}),
              ...(v.price !== undefined ? { price: parseFloat(v.price) } : {}),
              ...(v.stock !== undefined ? { stock: parseInt(v.stock, 10) } : {}),
              ...(v.condition ? { condition: v.condition } : {}),
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              sku: v.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              colorUz: v.colorUz || 'Standart',
              colorRu: v.colorRu || 'Стандарт',
              colorCode: v.colorCode || '#25282A',
              memoryRom: v.memoryRom,
              memoryRam: v.memoryRam,
              price: parseFloat(v.price || basePrice || 0),
              stock: parseInt(v.stock, 10) || 0,
              condition: v.condition || 'NEW',
            },
          });
        }
      }
    } else if (stock !== undefined || colorUz !== undefined || memoryRom !== undefined) {
      const defaultVariant = await prisma.productVariant.findFirst({
        where: { productId: id },
        orderBy: { isDefault: 'desc' },
      });
      if (defaultVariant) {
        await prisma.productVariant.update({
          where: { id: defaultVariant.id },
          data: {
            ...(stock !== undefined ? { stock: parseInt(stock, 10) } : {}),
            ...(colorUz ? { colorUz } : {}),
            ...(colorRu ? { colorRu } : {}),
            ...(memoryRom !== undefined ? { memoryRom } : {}),
            ...(memoryRam !== undefined ? { memoryRam } : {}),
            ...(basePrice !== undefined ? { price: parseFloat(basePrice) } : {}),
          },
        });
      }
    }

    // 4. Return updated product with relations
    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      },
    });

    res.json(finalProduct);
  }

  static async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Mahsulot muvaffaqiyatli oʻchirildi' });
  }

  // ===================== 4. INSTALLMENT PLANS CONFIG =====================
  static async getInstallmentPlans(req: Request, res: Response) {
    const plans = await prisma.installmentPlan.findMany({
      orderBy: { months: 'asc' },
    });
    res.json(plans);
  }

  static async updateInstallmentPlan(req: Request, res: Response) {
    const { id } = req.params;
    const { markupPercent, minDownPaymentPercent, maxDownPaymentPercent, isActive } = req.body;

    const updated = await prisma.installmentPlan.update({
      where: { id },
      data: {
        ...(markupPercent !== undefined ? { markupPercent: parseFloat(markupPercent) } : {}),
        ...(minDownPaymentPercent !== undefined ? { minDownPaymentPercent: parseFloat(minDownPaymentPercent) } : {}),
        ...(maxDownPaymentPercent !== undefined ? { maxDownPaymentPercent: parseFloat(maxDownPaymentPercent) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    res.json(updated);
  }

  // ===================== 5. BANNERS CRUD =====================
  static async getBanners(req: Request, res: Response) {
    const banners = await prisma.banner.findMany({ orderBy: { order: 'asc' } });
    res.json(banners);
  }

  static async createBanner(req: Request, res: Response) {
    const { titleUz, titleRu, subtitleUz, subtitleRu, badgeUz, badgeRu, linkUrl, imageUrlDesktop, imageUrlMobile, order } = req.body;
    const banner = await prisma.banner.create({
      data: {
        titleUz,
        titleRu,
        subtitleUz,
        subtitleRu,
        badgeUz,
        badgeRu,
        linkUrl,
        imageUrlDesktop,
        imageUrlMobile: imageUrlMobile || imageUrlDesktop,
        order: order || 0,
      },
    });
    res.status(201).json(banner);
  }

  static async deleteBanner(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    res.json({ message: 'Banner oʻchirildi' });
  }

  // ===================== 6. BRANCHES CRUD =====================
  static async getBranches(req: Request, res: Response) {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  }

  static async createBranch(req: Request, res: Response) {
    const { nameUz, nameRu, addressUz, addressRu, workingHours, phone, latitude, longitude } = req.body;
    const branch = await prisma.branch.create({
      data: {
        nameUz,
        nameRu,
        addressUz,
        addressRu,
        workingHours,
        phone,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });
    res.status(201).json(branch);
  }

  static async updateBranch(req: Request, res: Response) {
    const { id } = req.params;
    const { nameUz, nameRu, addressUz, addressRu, workingHours, phone, latitude, longitude, isActive } = req.body;
    const branch = await prisma.branch.update({
      where: { id },
      data: {
        ...(nameUz ? { nameUz } : {}),
        ...(nameRu ? { nameRu } : {}),
        ...(addressUz ? { addressUz } : {}),
        ...(addressRu ? { addressRu } : {}),
        ...(workingHours ? { workingHours } : {}),
        ...(phone ? { phone } : {}),
        ...(latitude !== undefined ? { latitude: parseFloat(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: parseFloat(longitude) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });
    res.json(branch);
  }

  static async deleteBranch(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.branch.delete({ where: { id } });
    res.json({ message: 'Filial oʻchirildi' });
  }

  // ===================== 7. STAFF USERS =====================
  static async getUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  }

  // ===================== 8. UPLOAD IMAGE =====================
  static async uploadImage(req: Request, res: Response) {
    const imageUrl = (req as any).processedImageUrl;
    if (!imageUrl) {
      return res.status(400).json({ message: 'Rasm fayli yuklanmadi' });
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return res.json({
        url: imageUrl,
        relativePath: imageUrl,
      });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fullUrl = `${protocol}://${host}${imageUrl}`;

    res.json({
      url: fullUrl,
      relativePath: imageUrl,
    });
  }

  // ===================== 9. SYSTEM SETTINGS =====================
  static async getSettings(req: Request, res: Response) {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(settingsMap);
  }

  static async updateSettings(req: Request, res: Response) {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(settingsMap);
  }
}
