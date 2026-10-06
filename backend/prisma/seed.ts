import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.applicationStatusLog.deleteMany();
  await prisma.applicationItem.deleteMany();
  await prisma.application.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.installmentPlan.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);
  const operatorHash = await bcrypt.hash('operator123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nasiyago.uz',
      passwordHash,
      name: 'Sherzod Aliyev (Bosh admin)',
      phone: '+998901234567',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@nasiyago.uz',
      passwordHash: managerHash,
      name: 'Azizbek Qodirov (Katta menejer)',
      phone: '+998907654321',
      role: 'MANAGER',
    },
  });

  await prisma.user.create({
    data: {
      email: 'operator@nasiyago.uz',
      passwordHash: operatorHash,
      name: 'Dilnoza Karimova (Operator)',
      phone: '+998935554433',
      role: 'OPERATOR',
    },
  });

  console.log('✅ Users created');

  // 2. Installment Plans
  await prisma.installmentPlan.createMany({
    data: [
      { months: 3, markupPercent: 8.0, minDownPaymentPercent: 0, maxDownPaymentPercent: 50, order: 1 },
      { months: 6, markupPercent: 15.0, minDownPaymentPercent: 0, maxDownPaymentPercent: 50, order: 2 },
      { months: 9, markupPercent: 22.0, minDownPaymentPercent: 0, maxDownPaymentPercent: 50, order: 3 },
      { months: 12, markupPercent: 28.0, minDownPaymentPercent: 0, maxDownPaymentPercent: 50, order: 4 },
    ],
  });
  console.log('✅ Installment plans created');

  // 3. Brands
  const apple = await prisma.brand.create({
    data: {
      name: 'Apple',
      slug: 'apple',
      logoUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      order: 1,
    },
  });

  const samsung = await prisma.brand.create({
    data: {
      name: 'Samsung',
      slug: 'samsung',
      logoUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      order: 2,
    },
  });

  const xiaomi = await prisma.brand.create({
    data: {
      name: 'Xiaomi',
      slug: 'xiaomi',
      logoUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      order: 3,
    },
  });

  const honor = await prisma.brand.create({
    data: {
      name: 'Honor',
      slug: 'honor',
      logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      order: 4,
    },
  });

  // 4. Categories
  const smartphones = await prisma.category.create({
    data: {
      nameUz: 'Smartfonlar',
      nameRu: 'Смартфоны',
      slug: 'smartphones',
      icon: 'smartphone',
      order: 1,
    },
  });

  const tablets = await prisma.category.create({
    data: {
      nameUz: 'Planshetlar',
      nameRu: 'Планшеты',
      slug: 'tablets',
      icon: 'tablet',
      order: 2,
    },
  });

  const laptops = await prisma.category.create({
    data: {
      nameUz: 'Noutbuklar',
      nameRu: 'Ноутбуки',
      slug: 'laptops',
      icon: 'laptop',
      order: 3,
    },
  });

  const accessories = await prisma.category.create({
    data: {
      nameUz: 'Aksessuarlar',
      nameRu: 'Аксессуары',
      slug: 'accessories',
      icon: 'headphones',
      order: 4,
    },
  });

  // 5. Branches in Tashkent
  const branchChilonzor = await prisma.branch.create({
    data: {
      nameUz: 'Chilonzor filiali',
      nameRu: 'Филиал Чиланзар',
      addressUz: "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi 42 (Metro Mirzo Ulug'bek)",
      addressRu: 'г. Ташкент, Чиланзарский р-н, проспект Бунёдкор 42 (Метро Мирзо Улугбек)',
      workingHours: '09:00 - 21:00 (Har kuni / Без выходных)',
      phone: '+998 71 200 44 00',
      latitude: 41.2825,
      longitude: 69.2135,
    },
  });

  await prisma.branch.create({
    data: {
      nameUz: 'Yunusobod filiali',
      nameRu: 'Филиал Юнусабад',
      addressUz: "Toshkent sh., Yunusobod tumani, Amir Temur shoh ko'chasi 107B (Metro Shahriston)",
      addressRu: 'г. Ташкент, Юнусабадский р-н, проспект Амира Темура 107Б (Метро Шахристан)',
      workingHours: '09:00 - 21:00 (Har kuni / Без выходных)',
      phone: '+998 71 200 44 01',
      latitude: 41.3532,
      longitude: 69.2882,
    },
  });

  await prisma.branch.create({
    data: {
      nameUz: 'Malika savdo majmuasi',
      nameRu: 'ТЦ Малика',
      addressUz: "Toshkent sh., Shayxontohur tumani, Kichik halqa yo'li 14, B-blok 24-do'kon",
      addressRu: 'г. Ташкент, Шайхантахурский р-н, Малая кольцевая 14, Б-блок, магазин 24',
      workingHours: '10:00 - 20:00',
      phone: '+998 71 200 44 02',
      latitude: 41.3412,
      longitude: 69.2678,
    },
  });

  // 6. Banners
  await prisma.banner.createMany({
    data: [
      {
        titleUz: 'iPhone 16 Pro — 0% boshlangʻich toʻlov bilan nasiya!',
        titleRu: 'iPhone 16 Pro — Рассрочка без первого взноса 0%!',
        subtitleUz: 'Bankka bormasdan, 15 daqiqada faqat pasport orqali tasdiqlash.',
        subtitleRu: 'Без походов в банк, оформление за 15 минут только по паспорту.',
        badgeUz: '0% Boshlangʻich toʻlov',
        badgeRu: '0% Первый взнос',
        linkUrl: '/catalog?brand=apple',
        imageUrlDesktop: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&auto=format&fit=crop&q=80',
        imageUrlMobile: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        order: 1,
      },
      {
        titleUz: 'Samsung Galaxy S24 Ultra — Sunʼiy intellekt kuchi',
        titleRu: 'Samsung Galaxy S24 Ultra — Мощь искусственного интеллекта Galaxy AI',
        subtitleUz: 'Toshkent boʻylab 3 soat ichida bepul kuryer orqali yetkazish!',
        subtitleRu: 'Бесплатная доставка курьером по Ташкенту за 3 часа!',
        badgeUz: 'Hafta hiti',
        badgeRu: 'Хит недели',
        linkUrl: '/catalog?brand=samsung',
        imageUrlDesktop: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1600&auto=format&fit=crop&q=80',
        imageUrlMobile: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
        order: 2,
      },
      {
        titleUz: 'Redmi Note 13 Pro+ — Hamyonbop flagman',
        titleRu: 'Redmi Note 13 Pro+ — Доступный флагман в рассрочку',
        subtitleUz: 'Oyiga bor-yoʻgʻi 415 000 soʻmdan boshlab toʻlang.',
        subtitleRu: 'Всего от 415 000 сум в месяц без скрытых комиссий.',
        badgeUz: 'Super narx',
        badgeRu: 'Супер цена',
        linkUrl: '/catalog?brand=xiaomi',
        imageUrlDesktop: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1600&auto=format&fit=crop&q=80',
        imageUrlMobile: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
        order: 3,
      },
    ],
  });

  // 7. System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'site_name', value: 'NasiyaGo Electronics', description: 'Brand name' },
      { key: 'phone_hotline', value: '+998 71 200 44 00', description: 'Customer support hotline' },
      { key: 'telegram_channel', value: 'https://t.me/nasiyago_uz', description: 'Telegram channel' },
      { key: 'instagram', value: 'https://instagram.com/nasiyago_uz', description: 'Instagram handle' },
      { key: 'require_passport', value: 'false', description: 'Require passport on initial submission' },
      { key: 'free_delivery_tashkent', value: 'true', description: 'Free delivery in Tashkent' },
    ],
  });

  // 8. 12 Real Products across Apple, Samsung, Xiaomi, Honor
  const productsData = [
    // 1. Apple iPhone 15 Pro Max
    {
      brandId: apple.id,
      categoryId: smartphones.id,
      nameUz: 'Apple iPhone 15 Pro Max',
      nameRu: 'Apple iPhone 15 Pro Max',
      slug: 'apple-iphone-15-pro-max',
      descriptionUz: "Titan korpusli qudratli Apple iPhone 15 Pro Max. A17 Pro chipi, 5x optik kattalashtirishli 48 MP kamera va Action Button tugmasi bilan jihozlangan.",
      descriptionRu: "Флагманский Apple iPhone 15 Pro Max в корпусе из прочного титана. Оснащен мощным процессором A17 Pro, инновационной камерой 48 Мп с 5-кратным оптическим зумом и кнопкой действия.",
      basePrice: 15400000,
      isHit: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1695048133021-f3b14562c16f?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '6.7 dyuym Super Retina XDR OLED 120Hz', valueRu: '6.7 дюймов Super Retina XDR OLED 120Гц' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Apple A17 Pro (3 nm)', valueRu: 'Apple A17 Pro (3 нм)' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Asosiy kamera', labelRu: 'Основная камера', valueUz: '48 MP + 12 MP + 12 MP (5x zoom)', valueRu: '48 Мп + 12 Мп + 12 Мп (5x зум)' },
        { groupUz: 'Batareya', groupRu: 'Батарея', labelUz: 'Sigʻimi', labelRu: 'Емкость', valueUz: '4422 mA/soat, MagSafe tezkor quvvatlash', valueRu: '4422 мАч, быстрая зарядка MagSafe' },
      ],
      variants: [
        { sku: 'APL-15PM-256-NT', colorUz: 'Natural Titanium', colorRu: 'Натуральный титан', colorCode: '#9A958E', memoryRam: '8 GB', memoryRom: '256 GB', price: 15400000, oldPrice: 16200000, stock: 14, isDefault: true },
        { sku: 'APL-15PM-512-NT', colorUz: 'Natural Titanium', colorRu: 'Натуральный титан', colorCode: '#9A958E', memoryRam: '8 GB', memoryRom: '512 GB', price: 17800000, oldPrice: 18900000, stock: 8, isDefault: false },
        { sku: 'APL-15PM-256-BL', colorUz: 'Black Titanium', colorRu: 'Черный титан', colorCode: '#2B2B2D', memoryRam: '8 GB', memoryRom: '256 GB', price: 15400000, oldPrice: 16200000, stock: 12, isDefault: false },
      ],
    },

    // 2. Apple iPhone 16 Pro
    {
      brandId: apple.id,
      categoryId: smartphones.id,
      nameUz: 'Apple iPhone 16 Pro',
      nameRu: 'Apple iPhone 16 Pro',
      slug: 'apple-iphone-16-pro',
      descriptionUz: "Eng so'nggi avlod iPhone 16 Pro. Apple Intelligence sun'iy intellekti uchun maxsus A18 Pro protsessori, Camera Control tugmasi va 48 MP ultra-keng burchakli kamera.",
      descriptionRu: "Новейший iPhone 16 Pro с поддержкой Apple Intelligence. Чип A18 Pro, новая сенсорная кнопка Camera Control и сверхширокоугольная камера 48 Мп.",
      basePrice: 16900000,
      isHit: false,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '6.3 dyuym Super Retina XDR ProMotion 120Hz', valueRu: '6.3 дюймов Super Retina XDR ProMotion 120Гц' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Apple A18 Pro (3 nm 2-avlod)', valueRu: 'Apple A18 Pro (3 нм 2-го поколения)' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Asosiy kamera', labelRu: 'Основная камера', valueUz: '48 MP Fusion + 48 MP Ultra Wide + 12 MP 5x Telephoto', valueRu: '48 Мп Fusion + 48 Мп Ультраширик + 12 Мп 5x Телевик' },
      ],
      variants: [
        { sku: 'APL-16P-128-DT', colorUz: 'Desert Titanium', colorRu: 'Пустынный титан', colorCode: '#CBB29B', memoryRam: '8 GB', memoryRom: '128 GB', price: 16900000, oldPrice: 17800000, stock: 15, isDefault: true },
        { sku: 'APL-16P-256-DT', colorUz: 'Desert Titanium', colorRu: 'Пустынный титан', colorCode: '#CBB29B', memoryRam: '8 GB', memoryRom: '256 GB', price: 18500000, oldPrice: 19400000, stock: 10, isDefault: false },
        { sku: 'APL-16P-256-WH', colorUz: 'White Titanium', colorRu: 'Белый титан', colorCode: '#F2F1ED', memoryRam: '8 GB', memoryRom: '256 GB', price: 18500000, oldPrice: 19400000, stock: 9, isDefault: false },
      ],
    },

    // 3. Apple iPhone 13
    {
      brandId: apple.id,
      categoryId: smartphones.id,
      nameUz: 'Apple iPhone 13',
      nameRu: 'Apple iPhone 13',
      slug: 'apple-iphone-13',
      descriptionUz: "Eng ishonchli va eng ommabop Apple smartfoni. A15 Bionic chipi, ajoyib batareya avtonomiyasi va qulay ixcham dizayn.",
      descriptionRu: "Самый проверенный и популярный смартфон Apple. Процессор A15 Bionic, отличная автономность и яркий экран Super Retina XDR.",
      basePrice: 7100000,
      isHit: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '6.1 dyuym Super Retina XDR OLED', valueRu: '6.1 дюймов Super Retina XDR OLED' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Apple A15 Bionic', valueRu: 'Apple A15 Bionic' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Asosiy kamera', labelRu: 'Основная камера', valueUz: '12 MP + 12 MP tungi rejim bilan', valueRu: '12 Мп + 12 Мп с ночным режимом' },
      ],
      variants: [
        { sku: 'APL-13-128-MD', colorUz: 'Midnight', colorRu: 'Темная ночь', colorCode: '#1A232A', memoryRam: '4 GB', memoryRom: '128 GB', price: 7100000, oldPrice: 7600000, stock: 25, isDefault: true },
        { sku: 'APL-13-128-ST', colorUz: 'Starlight', colorRu: 'Сияющая звезда', colorCode: '#FAF7F2', memoryRam: '4 GB', memoryRom: '128 GB', price: 7100000, oldPrice: 7600000, stock: 18, isDefault: false },
      ],
    },

    // 4. Samsung Galaxy S24 Ultra
    {
      brandId: samsung.id,
      categoryId: smartphones.id,
      nameUz: 'Samsung Galaxy S24 Ultra',
      nameRu: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      descriptionUz: "Galaxy AI sun'iy intellekti, o'rnatilgan S Pen ruchkasi, 200 MP ultra-aniq kamera va mustahkam titan rom.",
      descriptionRu: "Премиальный смартфон с искусственным интеллектом Galaxy AI, встроенным стилусом S Pen, камерой 200 Мп и титановым корпусом.",
      basePrice: 14200000,
      isHit: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '6.8 dyuym Dynamic AMOLED 2X 120Hz Gorilla Armor', valueRu: '6.8 дюймов Dynamic AMOLED 2X 120Гц Gorilla Armor' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Snapdragon 8 Gen 3 for Galaxy', valueRu: 'Snapdragon 8 Gen 3 for Galaxy' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Asosiy kamera', labelRu: 'Основная камера', valueUz: '200 MP + 50 MP (5x) + 12 MP + 10 MP (3x)', valueRu: '200 Мп + 50 Мп (5x) + 12 Мп + 10 Мп (3x)' },
        { groupUz: 'Batareya', groupRu: 'Батарея', labelUz: 'Sigʻimi', labelRu: 'Емкость', valueUz: '5000 mA/soat, 45W tezkor quvvat', valueRu: '5000 мАч, быстрая зарядка 45Вт' },
      ],
      variants: [
        { sku: 'SAM-S24U-256-GR', colorUz: 'Titanium Gray', colorRu: 'Серый титан', colorCode: '#737270', memoryRam: '12 GB', memoryRom: '256 GB', price: 14200000, oldPrice: 15300000, stock: 16, isDefault: true },
        { sku: 'SAM-S24U-512-GR', colorUz: 'Titanium Gray', colorRu: 'Серый титан', colorCode: '#737270', memoryRam: '12 GB', memoryRom: '512 GB', price: 16100000, oldPrice: 17200000, stock: 8, isDefault: false },
        { sku: 'SAM-S24U-256-BK', colorUz: 'Titanium Black', colorRu: 'Черный титан', colorCode: '#343336', memoryRam: '12 GB', memoryRom: '256 GB', price: 14200000, oldPrice: 15300000, stock: 12, isDefault: false },
      ],
    },

    // 5. Samsung Galaxy Z Flip6
    {
      brandId: samsung.id,
      categoryId: smartphones.id,
      nameUz: 'Samsung Galaxy Z Flip6',
      nameRu: 'Samsung Galaxy Z Flip6',
      slug: 'samsung-galaxy-z-flip6',
      descriptionUz: "Bukuluvchan zamonaviy dizayn, FlexWindow tashqi ekrani, 50 MP yangi kamera va Galaxy AI yordamchisi.",
      descriptionRu: "Компактный складной флагман с внешним экраном FlexWindow, новой камерой 50 Мп и возможностями Galaxy AI.",
      basePrice: 11900000,
      isHit: false,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Asosiy ekran', labelRu: 'Основной экран', valueUz: '6.7 dyuym Dynamic AMOLED 2X 120Hz', valueRu: '6.7 дюймов Dynamic AMOLED 2X 120Гц' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Snapdragon 8 Gen 3 for Galaxy', valueRu: 'Snapdragon 8 Gen 3 for Galaxy' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Asosiy kamera', labelRu: 'Основная камера', valueUz: '50 MP Dual Pixel OIS + 12 MP Ultra Wide', valueRu: '50 Мп Dual Pixel OIS + 12 Мп Ультраширик' },
      ],
      variants: [
        { sku: 'SAM-ZFLIP6-256-MT', colorUz: 'Mint', colorRu: 'Мятный', colorCode: '#BCE4D8', memoryRam: '12 GB', memoryRom: '256 GB', price: 11900000, oldPrice: 12800000, stock: 7, isDefault: true },
        { sku: 'SAM-ZFLIP6-256-SL', colorUz: 'Silver Shadow', colorRu: 'Серебристый', colorCode: '#C6C7C9', memoryRam: '12 GB', memoryRom: '256 GB', price: 11900000, oldPrice: 12800000, stock: 6, isDefault: false },
      ],
    },

    // 6. Samsung Galaxy A55 5G
    {
      brandId: samsung.id,
      categoryId: smartphones.id,
      nameUz: 'Samsung Galaxy A55 5G',
      nameRu: 'Samsung Galaxy A55 5G',
      slug: 'samsung-galaxy-a55-5g',
      descriptionUz: "Metall romli va shisha orqa panelli sifatli o'rta toifadagi yetakchi. Super AMOLED 120Hz ekrani va IP67 suvdan himoyasi.",
      descriptionRu: "Хит продаж в металлическом корпусе с защитой от воды IP67, ярким Super AMOLED экраном 120 Гц и отличными камерами.",
      basePrice: 4600000,
      isHit: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '6.6 dyuym Super AMOLED 120Hz FHD+', valueRu: '6.6 дюймов Super AMOLED 120Гц FHD+' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Exynos 1480 (4 nm)', valueRu: 'Exynos 1480 (4 нм)' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Asosiy kamera', labelRu: 'Основная камера', valueUz: '50 MP OIS + 12 MP + 5 MP', valueRu: '50 Мп OIS + 12 Мп + 5 Мп' },
      ],
      variants: [
        { sku: 'SAM-A55-128-IB', colorUz: 'Awesome Iceblue', colorRu: 'Ледяной голубой', colorCode: '#D2E3F4', memoryRam: '8 GB', memoryRom: '128 GB', price: 4600000, oldPrice: 4950000, stock: 30, isDefault: true },
        { sku: 'SAM-A55-256-NV', colorUz: 'Awesome Navy', colorRu: 'Темно-синий', colorCode: '#1C263A', memoryRam: '8 GB', memoryRom: '256 GB', price: 5100000, oldPrice: 5500000, stock: 22, isDefault: false },
      ],
    },

    // 7. Xiaomi 14 Ultra
    {
      brandId: xiaomi.id,
      categoryId: smartphones.id,
      nameUz: 'Xiaomi 14 Ultra',
      nameRu: 'Xiaomi 14 Ultra',
      slug: 'xiaomi-14-ultra',
      descriptionUz: "Leica optikasi va 1 dyuymli asosiy sensorga ega professional kamerofon. Snapdragon 8 Gen 3 va WQHD+ 120Hz ekrani.",
      descriptionRu: "Профессиональный камерофон с оптикой Leica, 1-дюймовым датчиком Sony LYT-900 и флагманским чипом Snapdragon 8 Gen 3.",
      basePrice: 13900000,
      isHit: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '6.73 dyuym AMOLED WQHD+ 120Hz 3000 nit', valueRu: '6.73 дюймов AMOLED WQHD+ 120Гц 3000 нит' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Leica kameralar', labelRu: 'Камеры Leica', valueUz: '50 MP (1") + 50 MP (3.2x) + 50 MP (5x) + 50 MP Ultra Wide', valueRu: '50 Мп (1") + 50 Мп (3.2x) + 50 Мп (5x) + 50 Мп Ультраширик' },
        { groupUz: 'Batareya', groupRu: 'Батарея', labelUz: 'Sigʻimi', labelRu: 'Емкость', valueUz: '5000 mA/soat, 90W simli + 80W simsiz', valueRu: '5000 мАч, 90Вт проводная + 80Вт беспроводная' },
      ],
      variants: [
        { sku: 'MI-14U-512-BK', colorUz: 'Qora (Black)', colorRu: 'Черный (Black)', colorCode: '#1A1A1A', memoryRam: '16 GB', memoryRom: '512 GB', price: 13900000, oldPrice: 14800000, stock: 11, isDefault: true },
        { sku: 'MI-14U-512-WH', colorUz: 'Oq (White)', colorRu: 'Белый (White)', colorCode: '#F4F4F4', memoryRam: '16 GB', memoryRom: '512 GB', price: 13900000, oldPrice: 14800000, stock: 8, isDefault: false },
      ],
    },

    // 8. Redmi Note 13 Pro+ 5G
    {
      brandId: xiaomi.id,
      categoryId: smartphones.id,
      nameUz: 'Redmi Note 13 Pro+ 5G',
      nameRu: 'Redmi Note 13 Pro+ 5G',
      slug: 'redmi-note-13-pro-plus-5g',
      descriptionUz: "200 MP kamera OIS bilan, 120W giper-quvvatlash (19 daqiqada 100%), egri CrystalRes AMOLED 120Hz ekran va IP68 himoya.",
      descriptionRu: "Хит среднего класса: камера 200 Мп с OIS, сверхбыстрая зарядка 120 Вт (100% за 19 минут), изогнутый AMOLED экран и влагозащита IP68.",
      basePrice: 4800000,
      isHit: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '6.67 dyuym Curved AMOLED 1.5K 120Hz', valueRu: '6.67 дюймов Изогнутый AMOLED 1.5K 120Гц' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'MediaTek Dimensity 7200-Ultra (4 nm)', valueRu: 'MediaTek Dimensity 7200-Ultra (4 нм)' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Asosiy kamera', labelRu: 'Основная камера', valueUz: '200 MP OIS + 8 MP + 2 MP', valueRu: '200 Мп OIS + 8 Мп + 2 Мп' },
      ],
      variants: [
        { sku: 'RDM-N13PP-256-BK', colorUz: 'Midnight Black', colorRu: 'Полночный черный', colorCode: '#1F2022', memoryRam: '8 GB', memoryRom: '256 GB', price: 4800000, oldPrice: 5200000, stock: 24, isDefault: true },
        { sku: 'RDM-N13PP-512-PR', colorUz: 'Aurora Purple', colorRu: 'Полярный фиолетовый', colorCode: '#9D8EA8', memoryRam: '12 GB', memoryRom: '512 GB', price: 5400000, oldPrice: 5800000, stock: 15, isDefault: false },
      ],
    },

    // 9. Xiaomi Pad 6
    {
      brandId: xiaomi.id,
      categoryId: tablets.id,
      nameUz: 'Xiaomi Pad 6',
      nameRu: 'Xiaomi Pad 6',
      slug: 'xiaomi-pad-6',
      descriptionUz: "11 dyuymli 144Hz WQHD+ displeyli yupqa metall planshet. O'qish, ish va o'yinlar uchun ideal tanlov.",
      descriptionRu: "Тонкий металлический планшет с 11-дюймовым экраном WQHD+ 144 Гц и мощным чипом Snapdragon 870 для работы и развлечений.",
      basePrice: 4200000,
      isHit: false,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '11 dyuym IPS 2.8K 144Hz Dolby Vision', valueRu: '11 дюймов IPS 2.8K 144Гц Dolby Vision' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Qualcomm Snapdragon 870', valueRu: 'Qualcomm Snapdragon 870' },
        { groupUz: 'Batareya', groupRu: 'Батарея', labelUz: 'Sigʻimi', labelRu: 'Емкость', valueUz: '8840 mA/soat, 33W tezkor quvvat', valueRu: '8840 мАч, быстрая зарядка 33Вт' },
      ],
      variants: [
        { sku: 'MI-PAD6-128-GY', colorUz: 'Gravity Gray', colorRu: 'Серый гравий', colorCode: '#52555A', memoryRam: '8 GB', memoryRom: '128 GB', price: 4200000, oldPrice: 4600000, stock: 18, isDefault: true },
        { sku: 'MI-PAD6-256-GY', colorUz: 'Gravity Gray', colorRu: 'Серый гравий', colorCode: '#52555A', memoryRam: '8 GB', memoryRom: '256 GB', price: 4600000, oldPrice: 5000000, stock: 12, isDefault: false },
      ],
    },

    // 10. Honor Magic6 Pro
    {
      brandId: honor.id,
      categoryId: smartphones.id,
      nameUz: 'Honor Magic6 Pro',
      nameRu: 'Honor Magic6 Pro',
      slug: 'honor-magic6-pro',
      descriptionUz: "DxOMark reytingi yetakchisi: 180 MP periskop telefoto kamera, ko'zni charchatmaydigan 4320Hz PWM ekran va 5600 mA/soat kremniy-uglerod batareya.",
      descriptionRu: "Флагман Honor с перископической камерой 180 Мп, сверхбезопасным для глаз экраном ШИМ 4320 Гц и мощной батареей 5600 мАч.",
      basePrice: 12500000,
      isHit: false,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '6.8 dyuym LTPO OLED 120Hz 5000 nit', valueRu: '6.8 дюймов LTPO OLED 120Гц 5000 нит' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Snapdragon 8 Gen 3', valueRu: 'Snapdragon 8 Gen 3' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Asosiy kamera', labelRu: 'Основная камера', valueUz: '50 MP oʻzgaruvchan diafragma + 180 MP Telephoto + 50 MP Ultrawide', valueRu: '50 Мп перем. диафрагма + 180 Мп Телевик + 50 Мп Ультраширик' },
      ],
      variants: [
        { sku: 'HN-M6P-512-GN', colorUz: 'Epi Green', colorRu: 'Изумрудный зеленый', colorCode: '#3F6456', memoryRam: '12 GB', memoryRom: '512 GB', price: 12500000, oldPrice: 13500000, stock: 10, isDefault: true },
        { sku: 'HN-M6P-512-BK', colorUz: 'Midnight Black', colorRu: 'Черный', colorCode: '#1A1A1A', memoryRam: '12 GB', memoryRom: '512 GB', price: 12500000, oldPrice: 13500000, stock: 7, isDefault: false },
      ],
    },

    // 11. Honor 200 Pro
    {
      brandId: honor.id,
      categoryId: smartphones.id,
      nameUz: 'Honor 200 Pro',
      nameRu: 'Honor 200 Pro',
      slug: 'honor-200-pro',
      descriptionUz: "Studio Harcourt portret rejimi, 50 MP OIS uchta kamera va Snapdragon 8s Gen 3 quvvati bilan jihozlangan san'at asari.",
      descriptionRu: "Портретный мастер с технологиями легендарной французской фотостудии Studio Harcourt, экраном 120 Гц и чипом Snapdragon 8s Gen 3.",
      basePrice: 7800000,
      isHit: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '6.78 dyuym AMOLED 120Hz 4000 nit', valueRu: '6.78 дюймов AMOLED 120Гц 4000 нит' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Snapdragon 8s Gen 3 (4 nm)', valueRu: 'Snapdragon 8s Gen 3 (4 нм)' },
        { groupUz: 'Kamera', groupRu: 'Камера', labelUz: 'Asosiy kamera', labelRu: 'Основная камера', valueUz: '50 MP H9000 OIS + 50 MP Telephoto + 12 MP Ultra Wide', valueRu: '50 Мп H9000 OIS + 50 Мп Телевик + 12 Мп Ультраширик' },
      ],
      variants: [
        { sku: 'HN-200P-512-OC', colorUz: 'Ocean Cyan', colorRu: 'Морской бирюзовый', colorCode: '#98CED5', memoryRam: '12 GB', memoryRom: '512 GB', price: 7800000, oldPrice: 8300000, stock: 16, isDefault: true },
        { sku: 'HN-200P-512-WH', colorUz: 'Moonlight White', colorRu: 'Лунный белый', colorCode: '#F4F3EF', memoryRam: '12 GB', memoryRom: '512 GB', price: 7800000, oldPrice: 8300000, stock: 12, isDefault: false },
      ],
    },

    // 12. Apple MacBook Air M3 13.6"
    {
      brandId: apple.id,
      categoryId: laptops.id,
      nameUz: 'Apple MacBook Air 13.6" M3',
      nameRu: 'Apple MacBook Air 13.6" M3',
      slug: 'apple-macbook-air-13-m3',
      descriptionUz: "Yengil, nihoyatda tezkor va jim ishlovchi Apple MacBook Air. Yangi avlod M3 chipi, Liquid Retina ekrani va 18 soatlik batareya muddati.",
      descriptionRu: "Ультратонкий и невероятно производительный MacBook Air на чипе M3. Яркий дисплей Liquid Retina, бесшумный корпус и до 18 часов работы без подзарядки.",
      basePrice: 14800000,
      isHit: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
      ],
      specs: [
        { groupUz: 'Ekran', groupRu: 'Дисплей', labelUz: 'Diagonali', labelRu: 'Диагональ', valueUz: '13.6 dyuym Liquid Retina True Tone', valueRu: '13.6 дюймов Liquid Retina True Tone' },
        { groupUz: 'Protsessor', groupRu: 'Процессор', labelUz: 'Chip', labelRu: 'Процессор', valueUz: 'Apple M3 (8-core CPU, 10-core GPU)', valueRu: 'Apple M3 (8-ядерный CPU, 10-ядерный GPU)' },
        { groupUz: 'Batareya', groupRu: 'Батарея', labelUz: 'Avtonomiya', labelRu: 'Автономность', valueUz: '18 soatgacha, MagSafe 3 quvvatlash', valueRu: 'До 18 часов, зарядка MagSafe 3' },
      ],
      variants: [
        { sku: 'MAC-AIR-M3-16-256-SG', colorUz: 'Space Gray', colorRu: 'Серый космос', colorCode: '#4E5053', memoryRam: '16 GB', memoryRom: '256 GB', price: 14800000, oldPrice: 15600000, stock: 9, isDefault: true },
        { sku: 'MAC-AIR-M3-16-512-ST', colorUz: 'Starlight', colorRu: 'Сияющая звезда', colorCode: '#E4DFD8', memoryRam: '16 GB', memoryRom: '512 GB', price: 17200000, oldPrice: 18100000, stock: 6, isDefault: false },
      ],
    },
  ];

  for (const item of productsData) {
    const { specs, variants, images, ...pData } = item;
    const product = await prisma.product.create({
      data: {
        ...pData,
      },
    });

    // Create variants
    for (const v of variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          ...v,
        },
      });
    }

    // Create images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: images[i],
          isPrimary: i === 0,
          order: i,
        },
      });
    }

    // Create specs
    for (let i = 0; i < specs.length; i++) {
      await prisma.productSpec.create({
        data: {
          productId: product.id,
          ...specs[i],
          order: i,
        },
      });
    }
  }

  console.log(`✅ 12 sample gadgets across Apple, Samsung, Xiaomi, and Honor created with specs and variants!`);

  // 9. Sample initial Application for testing
  const sampleProduct = await prisma.product.findFirst({
    where: { slug: 'apple-iphone-15-pro-max' },
    include: { variants: true },
  });

  if (sampleProduct && sampleProduct.variants[0]) {
    const app = await prisma.application.create({
      data: {
        applicationNumber: 'NG-2026-1001',
        customerName: 'Sardor Rahimov',
        phone: '+998901234567',
        district: 'Chilonzor tumani',
        address: "Katta Chilonzor ko'chasi, 14-uy, 28-xonadon",
        passportSeries: 'AA 7654321',
        preferredContactTime: '10:00 - 13:00',
        deliveryMethod: 'DELIVERY',
        status: 'NEW',
        totalPrice: 19712000,
        downPayment: 0,
        loanAmount: 19712000,
        termMonths: 12,
        monthlyPayment: 1642667,
        markupPercent: 28.0,
        assignedManagerId: manager.id,
        internalNotes: "Mijoz bilan soat 11:00 da bog'lanish kerak. Nasiya muddati: 12 oy.",
        items: {
          create: {
            productId: sampleProduct.id,
            variantId: sampleProduct.variants[0].id,
            quantity: 1,
            unitPrice: sampleProduct.variants[0].price,
          },
        },
      },
    });

    await prisma.applicationStatusLog.create({
      data: {
        applicationId: app.id,
        oldStatus: null,
        newStatus: 'NEW',
        changedById: admin.id,
        comment: 'Ariza sayt orqali muvaffaqiyatli qabul qilindi',
      },
    });
    console.log('✅ Sample application NG-2026-1001 created');
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
