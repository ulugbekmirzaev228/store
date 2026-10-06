import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { InstallmentService } from '../services/installment.service.js';

export class ProductController {
  /**
   * Catalog product list with multi-attribute filtering, sorting & pagination
   */
  static async getProducts(req: Request, res: Response) {
    const {
      brand,
      category,
      minPrice,
      maxPrice,
      ram,
      rom,
      condition,
      search,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * take;

    const where: any = {
      isPublished: true,
    };

    if (brand) {
      where.brand = { slug: String(brand) };
    }

    if (category) {
      where.category = { slug: String(category) };
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { nameUz: { contains: q } },
        { nameRu: { contains: q } },
        { descriptionUz: { contains: q } },
        { descriptionRu: { contains: q } },
        {
          variants: {
            some: {
              sku: { contains: q },
            },
          },
        },
      ];
    }

    // Filter by variant attributes (RAM, ROM, Condition)
    if (ram || rom || condition) {
      where.variants = {
        some: {
          ...(ram ? { memoryRam: String(ram) } : {}),
          ...(rom ? { memoryRom: String(rom) } : {}),
          ...(condition ? { condition: String(condition) } : {}),
        },
      };
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { basePrice: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { basePrice: 'desc' };
    } else if (sort === 'popular') {
      orderBy = [{ isHit: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'newest') {
      orderBy = [{ isNew: 'desc' }, { createdAt: 'desc' }];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          brand: true,
          category: true,
          images: {
            orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
            take: 2,
          },
          variants: {
            where: { isDefault: true },
            take: 1,
          },
        },
      }),
    ]);

    // Compute "from X so'm/month" (default 12 months with 0% down payment)
    const items = await Promise.all(
      products.map(async (p) => {
        const price = p.variants[0]?.price || p.basePrice;
        const calc = await InstallmentService.calculate({
          price,
          termMonths: 12,
          downPaymentPercent: 0,
          customMarkupPercent: p.customMarkupPercent || undefined,
        });

        return {
          id: p.id,
          nameUz: p.nameUz,
          nameRu: p.nameRu,
          slug: p.slug,
          basePrice: p.basePrice,
          isHit: p.isHit,
          isNew: p.isNew,
          brand: p.brand,
          category: p.category,
          primaryImage: p.images[0]?.imageUrl || null,
          secondaryImage: p.images[1]?.imageUrl || null,
          defaultVariant: p.variants[0] || null,
          minMonthlyPayment: calc.monthlyPayment,
          total12MonthsPrice: calc.totalPrice,
        };
      })
    );

    res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  }

  /**
   * Full product details by slug with variants, specs, and installment options
   */
  static async getProductBySlug(req: Request, res: Response) {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
        },
        variants: {
          orderBy: [{ isDefault: 'desc' }, { price: 'asc' }],
          include: {
            images: true,
          },
        },
        specs: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product || !product.isPublished) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    // Active installment plans
    const plans = await InstallmentService.getPlans();
    const defaultPrice = product.variants[0]?.price || product.basePrice;

    // Precalculate standard installment options (3, 6, 9, 12 months with 0% down)
    const installmentOptions = await Promise.all(
      plans.map(async (plan) => {
        const calc = await InstallmentService.calculate({
          price: defaultPrice,
          termMonths: plan.months,
          downPaymentPercent: 0,
          customMarkupPercent: product.customMarkupPercent || plan.markupPercent,
        });
        return {
          months: plan.months,
          markupPercent: calc.markupPercent,
          monthlyPayment: calc.monthlyPayment,
          totalPrice: calc.totalPrice,
          overpayment: calc.overpayment,
        };
      })
    );

    // Similar products
    const similarProducts = await prisma.product.findMany({
      where: {
        isPublished: true,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: {
        brand: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    res.json({
      product,
      installmentOptions,
      similarProducts: similarProducts.map(p => ({
        id: p.id,
        nameUz: p.nameUz,
        nameRu: p.nameRu,
        slug: p.slug,
        basePrice: p.basePrice,
        brand: p.brand,
        primaryImage: p.images[0]?.imageUrl || null,
        minMonthlyPayment: Math.round((p.basePrice * 1.28) / 12),
      })),
    });
  }

  /**
   * Hits and New products for homepage
   */
  static async getFeatured(req: Request, res: Response) {
    const [hits, newArrivals] = await Promise.all([
      prisma.product.findMany({
        where: { isPublished: true, isHit: true },
        take: 8,
        include: {
          brand: true,
          category: true,
          images: { where: { isPrimary: true }, take: 1 },
          variants: { where: { isDefault: true }, take: 1 },
        },
      }),
      prisma.product.findMany({
        where: { isPublished: true, isNew: true },
        take: 8,
        include: {
          brand: true,
          category: true,
          images: { where: { isPrimary: true }, take: 1 },
          variants: { where: { isDefault: true }, take: 1 },
        },
      }),
    ]);

    const formatProduct = (p: any) => ({
      id: p.id,
      nameUz: p.nameUz,
      nameRu: p.nameRu,
      slug: p.slug,
      basePrice: p.basePrice,
      isHit: p.isHit,
      isNew: p.isNew,
      brand: p.brand,
      category: p.category,
      primaryImage: p.images[0]?.imageUrl || null,
      minMonthlyPayment: Math.round(((p.variants[0]?.price || p.basePrice) * 1.28) / 12),
    });

    res.json({
      hits: hits.map(formatProduct),
      newArrivals: newArrivals.map(formatProduct),
    });
  }

  /**
   * Instant search suggestions
   */
  static async getSearchSuggestions(req: Request, res: Response) {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const suggestions = await prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { nameUz: { contains: q } },
          { nameRu: { contains: q } },
          { brand: { name: { contains: q } } },
        ],
      },
      take: 6,
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        slug: true,
        basePrice: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true },
        },
      },
    });

    res.json(
      suggestions.map(s => ({
        id: s.id,
        nameUz: s.nameUz,
        nameRu: s.nameRu,
        slug: s.slug,
        basePrice: s.basePrice,
        image: s.images[0]?.imageUrl || null,
      }))
    );
  }
}
