# NasiyaGo Electronics 📱

> Production-ready e-commerce platform for smartphones and gadgets sold on **direct installment (nasiya / rassrochka) WITHOUT a bank**, tailored for the **Tashkent, Uzbekistan** market.

---

## 🌟 Key Highlights & Features

- **No Banks Involved (Bank aralashuvisiz):** In-house direct store installment model.
- **Tashkent-First UX (80%+ Mobile Traffic):** 
  - Dynamic phone masking (`+998 (__) ___-__-__`)
  - 12 Tashkent district selector (Chilonzor, Yunusobod, Mirobod, Sergeli, etc.)
  - Currency formatted strictly as Uzbek So'm (`12 500 000 so'm`)
  - 3-hour courier delivery across Tashkent or store pickup (Chilonzor, Yunusobod, Malika).
- **Interactive Installment Calculator:**
  - Real-time term selection: **3, 6, 9, 12 months**
  - Down payment slider: **0% to 50%**
  - Instant monthly payment breakdown, total price, and month-by-month repayment schedule
  - Mobile sticky "Nasiyaga olish" CTA bar on product pages.
- **Instant Telegram Alerts:** Dispatches detailed new application alerts directly to managers' Telegram group or channel.
- **Multilingual Support (i18n):** Uzbek Latin (`/uz/...`) and Russian (`/ru/...`) with instant locale switching.
- **Separate Protected Admin Panel (`/admin`):**
  - Dashboard analytics (KPI cards, conversion rate, daily/weekly application volume)
  - Applications board with status management (`NEW`, `IN_REVIEW`, `APPROVED`, `DELIVERED`, `REJECTED`, `CANCELLED`), manager assignment, and **Excel Export**
  - Products & variants CRUD (color, ROM, RAM, stock, specs) with WebP image processing
  - Installment markup rates editor per term
  - Branches and promo banners management.
- **SEO & Performance:** Product JSON-LD, sitemap.xml, robots.txt, Open Graph, clean slugs.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL (with SQLite zero-dependency local dev support)
- **Image Processing:** Sharp (auto-converts uploads to WebP)
- **Authentication:** JWT + Role-based Access Control (`ADMIN`, `MANAGER`, `OPERATOR`)
- **Excel Export:** `xlsx`
- **Deploy:** Docker & Docker Compose

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v18+ (tested on v24)
- **npm:** v9+

### 2. Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Generate Prisma client & sync database
npx prisma generate
npx prisma db push

# 3. Seed 12 sample gadgets across Apple, Samsung, Xiaomi, Honor + Staff users
npx tsx prisma/seed.ts

# 4. Run automated test suite
npx tsx src/test-api.ts

# 5. Start development backend server (Port 5000)
npm run dev
```

The backend REST API will be live at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Next.js development server (Port 3000)
npm run dev
```

Open your browser at `http://localhost:3000` (automatically redirects to `http://localhost:3000/uz`).

---

## 🔐 Staff & Admin Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Bosh Admin** | `admin@nasiyago.uz` | `admin123` | Full access to all settings, users, and CRUD |
| **Menejer** | `manager@nasiyago.uz` | `manager123` | Applications, products, and analytics |
| **Operator** | `operator@nasiyago.uz` | `operator123` | Application processing and status updates |

Admin Panel URL: `http://localhost:3000/admin/login`

---

## 📱 Public Storefront Routes

- `http://localhost:3000/uz` — Uzbek Latin Homepage
- `http://localhost:3000/ru` — Russian Homepage
- `http://localhost:3000/uz/catalog` — Multi-filter Catalog
- `http://localhost:3000/uz/product/apple-iphone-15-pro-max` — Product Details & Installment Calculator
- `http://localhost:3000/uz/status` — Application Status Tracker
- `http://localhost:3000/uz/compare` — Gadget Comparison (up to 3 models)
- `http://localhost:3000/uz/terms` — Terms of Direct Installment
- `http://localhost:3000/uz/delivery` — 3-Hour Tashkent Courier Details
- `http://localhost:3000/uz/stores` — Store Branches & Pickup Points
- `http://localhost:3000/uz/contacts` — Contacts & Callback

---

## 🐳 Docker Deployment

To launch the complete stack with PostgreSQL, Backend, and Frontend containers:

```bash
docker-compose up --build -d
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`
- **PostgreSQL:** Port `5432`

---

## 📐 Installment Calculation Formula

1. **Down Payment:**
   $$\text{Down Payment} = \text{Cash Price} \times \left(\frac{\text{Down Payment \%}}{100}\right)$$

2. **Loan Principal:**
   $$\text{Principal} = \text{Cash Price} - \text{Down Payment}$$

3. **Overpayment (Direct Margin):**
   $$\text{Overpayment} = \text{Principal} \times \left(\frac{\text{Markup \%}}{100}\right)$$

4. **Monthly Payment:**
   $$\text{Monthly Payment} = \frac{\text{Principal} + \text{Overpayment}}{\text{Term Months}}$$
