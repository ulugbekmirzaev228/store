import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

function parseCharacteristics(chars: string | undefined | null) {
  if (!chars || typeof chars !== 'string') return [];
  const lines = chars.split('\n').map((l) => l.trim()).filter(Boolean);
  const specs = [];
  const currentGroup = 'Texnik parametrlar';

  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      const label = lines[i];
      const value = lines[i + 1];
      specs.push({
        groupUz: currentGroup,
        groupRu: currentGroup,
        labelUz: label,
        labelRu: label,
        valueUz: value,
        valueRu: value,
        order: Math.floor(i / 2),
      });
    }
  }
  return specs;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== 'nasiyago_init_2026') {
    return NextResponse.json({ message: 'Notoʻgʻri maxfiy kalit' }, { status: 401 });
  }

  const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0', 10);
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '5', 10);

  try {
    // 1. Fetch catalog from Terabayt
    const res = await fetch('https://api.terabayt.uz/api/products?lang=uz&perPage=100', {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) {
      return NextResponse.json({ message: `Terabayt API xatosi: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const items = data.items || [];

    // Filter out Dyson
    const nonDyson = items.filter((p: any) => {
      const bName = (p.brand?.name || '').toLowerCase();
      const bSlug = (p.brand?.slug || '').toLowerCase();
      const cName = (p.category?.name || '').toLowerCase();
      const cSlug = (p.category?.slug || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      return (
        !bName.includes('dyson') &&
        !bSlug.includes('dyson') &&
        !cName.includes('dyson') &&
        !cSlug.includes('dyson') &&
        !pName.includes('dyson')
      );
    });

    // 2. Ensure Categories exist in DB (only on first batch)
    if (offset === 0) {
      const categoriesMap: Record<string, string> = {
        'cat-smartphones': 'Smartfonlar',
        'cat-tablets': 'Planshetlar',
        'cat-laptops': 'Noutbuklar',
        'cat-accessories': 'Aksessuarlar',
      };

      for (const [id, nameUz] of Object.entries(categoriesMap)) {
        const slug = id.replace('cat-', '');
        await prisma.category.upsert({
          where: { id },
          update: { nameUz, slug },
          create: {
            id,
            nameUz,
            nameRu:
              nameUz === 'Smartfonlar'
                ? 'Смартфоны'
                : nameUz === 'Planshetlar'
                ? 'Планшеты'
                : nameUz === 'Noutbuklar'
                ? 'Ноутбуки'
                : 'Аксессуары',
            slug,
            icon:
              nameUz === 'Smartfonlar'
                ? 'Smartphone'
                : nameUz === 'Planshetlar'
                ? 'Tablet'
                : nameUz === 'Noutbuklar'
                ? 'Laptop'
                : 'Headphones',
            order: 1,
          },
        });
      }

      // 3. Ensure Brands exist in DB (only on first batch)
      const brandsMap: Record<string, { name: string; slug: string; logo: string }> = {
        'brd-apple': {
          name: 'Apple',
          slug: 'apple',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
        },
        'brd-samsung': {
          name: 'Samsung',
          slug: 'samsung',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
        },
        'brd-xiaomi': {
          name: 'Xiaomi',
          slug: 'xiaomi',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg',
        },
      };

      for (const [id, b] of Object.entries(brandsMap)) {
        await prisma.brand.upsert({
          where: { id },
          update: { name: b.name, slug: b.slug, logoUrl: b.logo },
          create: {
            id,
            name: b.name,
            slug: b.slug,
            logoUrl: b.logo,
            isFeatured: true,
            order: 1,
          },
        });
      }
    }

    // 4. Slice batch
    const currentBatch = nonDyson.slice(offset, offset + limit);
    const importedProducts = [];

    for (const p of currentBatch) {
      try {
        const detailRes = await fetch(`https://api.terabayt.uz/api/products/${p.slug}?lang=uz`, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        });
        const detail = detailRes.ok ? await detailRes.json() : p;

        // Determine category
        let categoryId = 'cat-smartphones';
        const catSlug = (detail.category?.slug || p.category?.slug || '').toLowerCase();
        const prodName = (detail.name || p.name).toLowerCase();
        if (catSlug.includes('macbook') || prodName.includes('macbook')) {
          categoryId = 'cat-laptops';
        } else if (catSlug.includes('ipad') || prodName.includes('ipad')) {
          categoryId = 'cat-tablets';
        } else if (
          catSlug.includes('watch') ||
          catSlug.includes('airpods') ||
          prodName.includes('watch') ||
          prodName.includes('airpods')
        ) {
          categoryId = 'cat-accessories';
        }

        // Determine brand
        let brandId = 'brd-apple';
        const brandName = (detail.brand?.name || p.brand?.name || '').toLowerCase();
        if (brandName.includes('samsung') || prodName.includes('samsung')) {
          brandId = 'brd-samsung';
        } else if (
          brandName.includes('mi') ||
          brandName.includes('xiaomi') ||
          brandName.includes('redmi') ||
          prodName.includes('xiaomi') ||
          prodName.includes('redmi')
        ) {
          brandId = 'brd-xiaomi';
        }

        const basePrice = Number(detail.minPrice || p.minPrice || 1000000);
        const descriptionUz =
          detail.description ||
          `${detail.name} — eng soʻnggi modeldagi original gadjet. Toshkentda 12 oygacha qulay nasiya asosida.`;
        const descriptionRu =
          detail.description ||
          `${detail.name} — оригинальный гаджет с официальной гарантией. Рассрочка в Ташкенте без банка.`;

        // Upsert Product
        const product = await prisma.product.upsert({
          where: { slug: p.slug },
          update: {
            nameUz: detail.name || p.name,
            nameRu: detail.name || p.name,
            brandId,
            categoryId,
            basePrice,
            descriptionUz,
            descriptionRu,
            isPublished: true,
            isHit: Boolean((detail.rating && detail.rating > 4) || basePrice > 12000000),
            isNew: Boolean(
              p.slug.includes('17') ||
                p.slug.includes('s26') ||
                p.slug.includes('m5') ||
                p.slug.includes('16')
            ),
          },
          create: {
            slug: p.slug,
            nameUz: detail.name || p.name,
            nameRu: detail.name || p.name,
            brandId,
            categoryId,
            basePrice,
            descriptionUz,
            descriptionRu,
            isPublished: true,
            isHit: Boolean((detail.rating && detail.rating > 4) || basePrice > 12000000),
            isNew: Boolean(
              p.slug.includes('17') ||
                p.slug.includes('s26') ||
                p.slug.includes('m5') ||
                p.slug.includes('16')
            ),
          },
        });

        // Images
        const imagesList =
          detail.images && detail.images.length > 0 ? detail.images : p.images || [];
        if (imagesList.length > 0) {
          await prisma.productImage.deleteMany({ where: { productId: product.id } });
          await prisma.productImage.createMany({
            data: imagesList.map((imgUrl: string, idx: number) => ({
              productId: product.id,
              imageUrl: imgUrl,
              isPrimary: idx === 0,
              order: idx,
            })),
          });
        }

        // Variants
        const variantsList = detail.variants || [];
        await prisma.productVariant.deleteMany({ where: { productId: product.id } });

        if (variantsList.length > 0) {
          const formattedVariants = variantsList.map((v: any, idx: number) => {
            const colorSel = v.selection?.find(
              (s: any) =>
                (s.option && s.option.toLowerCase().includes('rang')) || s.optionKey === 'rang'
            );
            const romSel = v.selection?.find(
              (s: any) =>
                (s.option && s.option.toLowerCase().includes('xotira')) ||
                s.optionKey?.includes('xotira') ||
                (s.value && (s.value.includes('GB') || s.value.includes('TB')))
            );
            const ramSel = v.selection?.find(
              (s: any) => s.option && s.option.toLowerCase().includes('tezkor')
            );

            return {
              productId: product.id,
              sku: `${p.slug}-${v.sku || idx}`,
              colorUz: colorSel?.value || 'Standart',
              colorRu: colorSel?.value || 'Стандарт',
              colorCode: colorSel?.hex || '#1C1C1E',
              memoryRom: romSel?.value || '256GB',
              memoryRam: ramSel?.value || null,
              condition: 'NEW',
              price: Number(v.price || basePrice),
              stock: 12,
              isDefault: idx === 0 || Boolean(v.isDefault),
            };
          });

          await prisma.productVariant.createMany({
            data: formattedVariants,
          });
        } else {
          // Default variant
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              sku: `${p.slug}-default`,
              colorUz: 'Standart',
              colorRu: 'Стандарт',
              colorCode: '#1C1C1E',
              memoryRom: '256GB',
              condition: 'NEW',
              price: basePrice,
              stock: 15,
              isDefault: true,
            },
          });
        }

        // Specs
        const specsList = parseCharacteristics(detail.characteristics);
        if (specsList.length > 0) {
          await prisma.productSpec.deleteMany({ where: { productId: product.id } });
          await prisma.productSpec.createMany({
            data: specsList.map((s) => ({
              ...s,
              productId: product.id,
            })),
          });
        }

        importedProducts.push({
          id: product.id,
          name: product.nameUz,
          slug: product.slug,
          category: categoryId,
          brand: brandId,
          price: product.basePrice,
          variantsCount: variantsList.length || 1,
          imagesCount: imagesList.length,
        });
      } catch (prodErr: any) {
        console.error(`Error importing ${p.slug}:`, prodErr);
      }
    }

    const hasMore = offset + limit < nonDyson.length;
    const nextOffset = hasMore ? offset + limit : null;

    return NextResponse.json({
      success: true,
      offset,
      limit,
      totalNonDyson: nonDyson.length,
      importedInThisBatch: importedProducts.length,
      hasMore,
      nextOffset,
      products: importedProducts,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
