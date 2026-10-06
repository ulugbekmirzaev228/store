-- ==============================================================================
-- NASIYAGO ELECTRONICS - SUPABASE POSTGRESQL SCHEMA & INITIAL DATA
-- Qayta ishga tushirish uchun: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS "system_settings" CASCADE;
DROP TABLE IF EXISTS "branches" CASCADE;
DROP TABLE IF EXISTS "banners" CASCADE;
DROP TABLE IF EXISTS "application_status_logs" CASCADE;
DROP TABLE IF EXISTS "application_items" CASCADE;
DROP TABLE IF EXISTS "applications" CASCADE;
DROP TABLE IF EXISTS "installment_plans" CASCADE;
DROP TABLE IF EXISTS "product_specs" CASCADE;
DROP TABLE IF EXISTS "product_images" CASCADE;
DROP TABLE IF EXISTS "product_variants" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "brands" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- ==========================================
-- 3. TABLES DEFINITION
-- ==========================================

-- USERS
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- BRANDS
CREATE TABLE "brands" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "logoUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE "categories" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "nameUz" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "icon" TEXT,
    "parentId" TEXT REFERENCES "categories"("id") ON DELETE SET NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS
CREATE TABLE "products" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "brandId" TEXT NOT NULL REFERENCES "brands"("id") ON DELETE CASCADE,
    "categoryId" TEXT NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    "nameUz" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "descriptionUz" TEXT NOT NULL,
    "descriptionRu" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "isHit" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "customMarkupPercent" DOUBLE PRECISION,
    "minDownPaymentPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "products_slug_idx" ON "products"("slug");
CREATE INDEX "products_brandId_idx" ON "products"("brandId");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- PRODUCT VARIANTS
CREATE TABLE "product_variants" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "sku" TEXT NOT NULL UNIQUE,
    "colorUz" TEXT NOT NULL,
    "colorRu" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "memoryRam" TEXT,
    "memoryRom" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'NEW',
    "price" DOUBLE PRECISION NOT NULL,
    "oldPrice" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- PRODUCT IMAGES
CREATE TABLE "product_images" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "variantId" TEXT REFERENCES "product_variants"("id") ON DELETE SET NULL,
    "imageUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX "product_images_productId_idx" ON "product_images"("productId");

-- PRODUCT SPECS
CREATE TABLE "product_specs" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "groupUz" TEXT NOT NULL,
    "groupRu" TEXT NOT NULL,
    "labelUz" TEXT NOT NULL,
    "labelRu" TEXT NOT NULL,
    "valueUz" TEXT NOT NULL,
    "valueRu" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX "product_specs_productId_idx" ON "product_specs"("productId");

-- INSTALLMENT PLANS
CREATE TABLE "installment_plans" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "months" INTEGER NOT NULL UNIQUE,
    "markupPercent" DOUBLE PRECISION NOT NULL,
    "minDownPaymentPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDownPaymentPercent" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- STORE BRANCHES
CREATE TABLE "branches" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "nameUz" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "addressUz" TEXT NOT NULL,
    "addressRu" TEXT NOT NULL,
    "workingHours" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- APPLICATIONS
CREATE TABLE "applications" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "applicationNumber" TEXT NOT NULL UNIQUE,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "passportSeries" TEXT,
    "preferredContactTime" TEXT,
    "comment" TEXT,
    "deliveryMethod" TEXT NOT NULL DEFAULT 'DELIVERY',
    "branchId" TEXT REFERENCES "branches"("id") ON DELETE SET NULL,
    "termMonths" INTEGER NOT NULL,
    "downPayment" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "monthlyPayment" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "assignedManagerId" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "applications_phone_idx" ON "applications"("phone");
CREATE INDEX "applications_applicationNumber_idx" ON "applications"("applicationNumber");
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- APPLICATION ITEMS
CREATE TABLE "application_items" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "applicationId" TEXT NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
    "variantId" TEXT NOT NULL REFERENCES "product_variants"("id") ON DELETE RESTRICT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL
);

-- APPLICATION STATUS LOGS
CREATE TABLE "application_status_logs" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "applicationId" TEXT NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE,
    "oldStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "changedById" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- BANNERS
CREATE TABLE "banners" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "titleUz" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "subtitleUz" TEXT,
    "subtitleRu" TEXT,
    "badgeUz" TEXT,
    "badgeRu" TEXT,
    "linkUrl" TEXT NOT NULL,
    "imageUrlDesktop" TEXT NOT NULL,
    "imageUrlMobile" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- SYSTEM SETTINGS
CREATE TABLE "system_settings" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "description" TEXT
);

-- ==========================================
-- 4. INITIAL SEED DATA
-- ==========================================

-- Admins (password: admin123, manager123, operator123)
INSERT INTO "users" ("id", "email", "passwordHash", "name", "phone", "role") VALUES
('usr-admin-1', 'admin@nasiyago.uz', '$2a$10$Wq9f7K8oB6k9mC/P0bQoDeMfvYt1z1V9s9L5b1Y0eO8wG3e3K2O7.', 'Sherzod Aliyev (Bosh admin)', '+998901234567', 'ADMIN'),
('usr-mgr-1', 'manager@nasiyago.uz', '$2a$10$tZ2U6Cqf7r8W9e0.b9c8deRtyuIopAsDfGhJkLzXcVbNmQweRtYu.', 'Azizbek Qodirov (Katta menejer)', '+998907654321', 'MANAGER'),
('usr-opr-1', 'operator@nasiyago.uz', '$2a$10$yU8i9O0p1A2s3D4.f5g6hJkLzXcVbNmQweRtYuIoPaSdFgHjKlZx.', 'Dilnoza Karimova (Operator)', '+998935554433', 'OPERATOR');

-- Installment Plans (0% for 3 months, 12% for 6, 18% for 9, 24% for 12)
INSERT INTO "installment_plans" ("id", "months", "markupPercent", "minDownPaymentPercent", "maxDownPaymentPercent", "isActive") VALUES
('plan-3', 3, 0.0, 0, 50, true),
('plan-6', 6, 12.0, 0, 50, true),
('plan-9', 9, 18.0, 0, 50, true),
('plan-12', 12, 24.0, 0, 50, true);

-- Brands
INSERT INTO "brands" ("id", "name", "slug", "logoUrl", "isFeatured", "order") VALUES
('brd-apple', 'Apple', 'apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', true, 1),
('brd-samsung', 'Samsung', 'samsung', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', true, 2),
('brd-xiaomi', 'Xiaomi', 'xiaomi', 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg', true, 3),
('brd-honor', 'Honor', 'honor', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honor_logo.svg', true, 4);

-- Categories
INSERT INTO "categories" ("id", "nameUz", "nameRu", "slug", "icon", "order") VALUES
('cat-smartphones', 'Smartfonlar', 'Смартфоны', 'smartphones', 'Smartphone', 1),
('cat-tablets', 'Planshetlar', 'Планшеты', 'tablets', 'Tablet', 2),
('cat-laptops', 'Noutbuklar', 'Ноутбуки', 'laptops', 'Laptop', 3),
('cat-accessories', 'Aksessuarlar', 'Аксессуары', 'accessories', 'Headphones', 4);

-- Branches (with Tashkent GPS coordinates)
INSERT INTO "branches" ("id", "nameUz", "nameRu", "addressUz", "addressRu", "workingHours", "phone", "latitude", "longitude", "isActive") VALUES
('br-chilonzor', 'Chilonzor filiali (Bosh do''kon)', 'Филиал Чиланзар (Главный магазин)', 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko''chasi 15-uy (Mirzo Ulug''bek metro)', 'г. Ташкент, Чиланзарский р-н, проспект Бунёдкор, 15 (метро Мирзо Улугбек)', '09:00 - 21:00 (dam olish kunisiz)', '+998 71 200 44 01', 41.282700, 69.204500, true),
('br-yunusobod', 'Yunusobod Mega Planet filiali', 'Филиал Юнусабад Mega Planet', 'Toshkent sh., Yunusobod tumani, Ahmad Donish ko''chasi 2B (Mega Planet ro''parasi)', 'г. Ташкент, Юнусабадский р-н, ул. Ахмада Дониша 2Б (напротив Mega Planet)', '10:00 - 22:00 (har kuni)', '+998 71 200 44 02', 41.365300, 69.290500, true),
('br-malika', 'Malika savdo markazi filiali', 'Филиал Торговый комплекс Малика', 'Toshkent sh., Shayxontohur tumani, Kichik halqa yo''li, Malika savdo qatori, A-12 do''kon', 'г. Ташкент, Шайхантахурский р-н, Малая кольцевая, ряд Малика, магазин А-12', '09:00 - 20:00 (har kuni)', '+998 71 200 44 03', 41.338500, 69.262800, true);

-- System Settings
INSERT INTO "system_settings" ("id", "key", "value", "description") VALUES
('st-1', 'site_name', 'NasiyaGo Electronics', 'Sayt nomi'),
('st-2', 'logo_url', '', 'Sayt logotipi URL manzili'),
('st-3', 'phone_hotline', '+998 71 200 44 00', 'Do''kon aloqa telefoni'),
('st-4', 'telegram_channel', 'https://t.me/nasiyago_uz', 'Telegram rasmiy kanal'),
('st-5', 'instagram', 'https://instagram.com/nasiyago_uz', 'Instagram rasmiy profil'),
('st-6', 'require_passport', 'false', 'Arizada pasport so''rash majburiyligi'),
('st-7', 'free_delivery_tashkent', 'true', 'Toshkent bo''ylab bepul 3 soatlik yetkazib berish');

-- Sample Products
INSERT INTO "products" ("id", "brandId", "categoryId", "nameUz", "nameRu", "slug", "descriptionUz", "descriptionRu", "basePrice", "isHit", "isNew", "isPublished") VALUES
('prod-iphone-16-pro', 'brd-apple', 'cat-smartphones', 'Apple iPhone 16 Pro', 'Apple iPhone 16 Pro', 'apple-iphone-16-pro', 'Eng yangi A18 Pro chip, 48MP Fusion kamera, yangi Camera Control tugmasi va yupqa hoshiyali Super Retina XDR ekran. Bank aralashuvisiz qulay nasiya.', 'Новейший процессор A18 Pro, 48МП камера Fusion, кнопка Camera Control и титановый корпус.', 16400000, true, true, true),
('prod-s24-ultra', 'brd-samsung', 'cat-smartphones', 'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Galaxy AI sun''iy intellekt funksiyalari, 200MP asosiy kamera, o''rnatilgan S-Pen stilus va mustahkam titan korpus.', 'Титановый флагман с встроенным Galaxy AI, 200МП камерой и пером S-Pen.', 14900000, true, false, true),
('prod-xiaomi-14-ultra', 'brd-xiaomi', 'cat-smartphones', 'Xiaomi 14 Ultra (Leica)', 'Xiaomi 14 Ultra (Leica)', 'xiaomi-14-ultra', 'Professional Leica optikasi, 1 dyuymli fotosensor, Snapdragon 8 Gen 3 va WQHD+ 120Hz ekran.', 'Флагман с оптикой Leica, 1-дюймовым сенсором и Snapdragon 8 Gen 3.', 13200000, false, true, true),
('prod-honor-magic6-pro', 'brd-honor', 'cat-smartphones', 'Honor Magic 6 Pro', 'Honor Magic 6 Pro', 'honor-magic6-pro', 'Falcon kamerasi, 180MP telefoto, 5600 mAh kremniy-uglerod batareya va ko''zni charchatmaydigan 4320Hz PWM ekran.', 'Флагман с 180МП перископом, кремний-углеродным аккумулятором и экраном без мерцания.', 11800000, false, true, true);

-- Variants
INSERT INTO "product_variants" ("id", "productId", "sku", "colorUz", "colorRu", "colorCode", "memoryRam", "memoryRom", "condition", "price", "stock", "isDefault") VALUES
('var-1', 'prod-iphone-16-pro', 'SKU-IP16P-256-NT', 'Natural Titanium', 'Натуральный титан', '#9D978F', '8 GB', '256 GB', 'NEW', 16400000, 15, true),
('var-2', 'prod-s24-ultra', 'SKU-S24U-256-TB', 'Titanium Black', 'Титановый черный', '#2B2B2B', '12 GB', '256 GB', 'NEW', 14900000, 12, true),
('var-3', 'prod-xiaomi-14-ultra', 'SKU-X14U-512-BK', 'Black (Eko-charm)', 'Черный эко-кожа', '#1C1C1E', '16 GB', '512 GB', 'NEW', 13200000, 8, true),
('var-4', 'prod-honor-magic6-pro', 'SKU-HM6P-512-GR', 'Epi Green', 'Зеленый шалфей', '#4B6B58', '12 GB', '512 GB', 'NEW', 11800000, 10, true);

-- Images
INSERT INTO "product_images" ("id", "productId", "variantId", "imageUrl", "isPrimary", "order") VALUES
('img-1', 'prod-iphone-16-pro', 'var-1', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80', true, 0),
('img-2', 'prod-s24-ultra', 'var-2', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80', true, 0),
('img-3', 'prod-xiaomi-14-ultra', 'var-3', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80', true, 0),
('img-4', 'prod-honor-magic6-pro', 'var-4', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80', true, 0);

-- Banners
INSERT INTO "banners" ("id", "titleUz", "titleRu", "subtitleUz", "subtitleRu", "badgeUz", "badgeRu", "linkUrl", "imageUrlDesktop", "imageUrlMobile", "isActive", "order") VALUES
('ban-1', 'Yangi iPhone 16 Pro va Galaxy S24 Ultra', 'Новые iPhone 16 Pro и Galaxy S24 Ultra', 'Bank aralashuvisiz, boshlang''ich to''lovsiz, 12 oygacha qulay muddatli to''lov', 'Без банков, без первоначального взноса, рассрочка до 12 месяцев', '0% Boshlang''ich to''lov', '0% Первый взнос', '/uz/catalog', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80', true, 1);
