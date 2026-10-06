# 🚀 NasiyaGo Platformasini Vercel va Supabase'da Deploy Qilish Qo'llanmasi

Ushbu qo'llanma orqali platformangizni to'liq **Vercel** (Serverless) va **Supabase** (PostgreSQL ma'lumotlar bazasi + Storage) platformalarida 10-15 daqiqa ichida bepul va professional darajada ishga tushirishingiz mumkin.

---

## 1-QADAM: Supabase Ma'lumotlar Bazasini Tayyorlash

1. [supabase.com](https://supabase.com) saytiga kiring va ro'yxatdan o'ting (yoki tizimga kiring).
2. **"New project"** tugmasini bosing:
   - **Name:** `nasiyago-db`
   - **Database Password:** Kuchli parol o'ylab toping va uni eslab qoling (masalan: `NasiyaGo2026!Pass`)
   - **Region:** O'zbekistonga eng yaqin mintaqani tanlang (masalan, *Central Europe / Frankfurt*).
   - **Create new project** tugmasini bosing.

3. **Jadvallarni yaratish va dastlabki ma'lumotlarni kiritish (Seed):**
   - Supabase boshqaruv panelida chap menyudan **SQL Editor** bo'limiga kiring.
   - **New query** tugmasini bosing.
   - Loyihangizdagi `supabase_schema.sql` faylining barcha kodlarini nusxalab, SQL Editor oynasiga qo'ying.
   - **Run** (yoki `Ctrl + Enter`) tugmasini bosing.
   - *Natija:* 1-2 soniyada barcha jadvallar (`products`, `applications`, `users`, `branches`, va h.k.) va namuna ma'lumotlar to'liq yaratiladi!

4. **Rasmlar uchun Supabase Storage yaratish:**
   - Chap menyudan **Storage** bo'limiga kiring.
   - **New bucket** tugmasini bosing.
   - Bucket nomi: `images`
   - **"Public bucket"** katakchasini albatta yoqing (Public bo'lishi shart).
   - **Save** tugmasini bosing.

5. **Ulanish kalitlarini olish:**
   - **Project Settings** -> **Database** bo'limiga o'ting:
     - **Connection string** bo'limidan:
       - **Transaction Pooler (Port 6543):** Bu `DATABASE_URL` bo'ladi.
       - **Direct connection (Port 5432):** Bu `DIRECT_URL` bo'ladi.
       *(Eslatma: parolingiz qismidagi `[YOUR-PASSWORD]` o'rniga o'zingiz o'rnatgan parolni yozasiz)*.
   - **Project Settings** -> **API** bo'limiga o'ting:
     - **Project URL:** Bu `SUPABASE_URL`
     - **Project API keys** -> `service_role` (secret) kalitini nusxalang -> Bu `SUPABASE_SERVICE_ROLE_KEY`.

---

## 2-QADAM: Backend'ni Vercel'da Deploy Qilish

1. [vercel.com](https://vercel.com) saytiga kiring va GitHub repozitoriyangizni ulang.
2. **"Add New Project"** tugmasini bosing va loyihangizni tanlang.
3. Loyiha sozlamalarida:
   - **Project Name:** `nasiyago-backend`
   - **Framework Preset:** `Other` (yoki avtomatik qoldiring)
   - **Root Directory:** Edit tugmasini bosib, `backend` papkasini tanlang!
4. **Environment Variables** (Atrof-muhit o'zgaruvchilari) bo'limini oching va quyidagilarni kiriting:
   - `DATABASE_URL` = *(Supabase Transaction Pooler URL, port 6543, oxirida `?pgbouncer=true`)*
   - `DIRECT_URL` = *(Supabase Direct URL, port 5432)*
   - `SUPABASE_URL` = *(Supabase Project URL, masalan: `https://xxxx.supabase.co`)*
   - `SUPABASE_SERVICE_ROLE_KEY` = *(Supabase service_role kaliti)*
   - `JWT_SECRET` = *(Ixtiyoriy kuchli kalit, masalan: `nasiyago-production-jwt-secret-2026`)*
   - `NODE_ENV` = `production`
5. **Deploy** tugmasini bosing.
6. Deploy yakunlangach, Vercel sizga Backend URL manzilini beradi, masalan:
   👉 `https://nasiyago-backend.vercel.app`

---

## 3-QADAM: Frontend (Next.js)'ni Vercel'da Deploy Qilish

1. Vercel dashboardida yana **"Add New Project"** tugmasini bosing va o'sha repozitoriyani tanlang.
2. Loyiha sozlamalarida:
   - **Project Name:** `nasiyago-store`
   - **Framework Preset:** `Next.js` (avtomatik aniqlanadi)
   - **Root Directory:** Edit tugmasini bosib, `frontend` papkasini tanlang!
3. **Environment Variables** bo'limiga quyidagilarni kiriting:
   - `NEXT_PUBLIC_API_URL` = `https://nasiyago-backend.vercel.app` *(2-bosqichda chiqqan backend manzili)*
4. **Deploy** tugmasini bosing.
5. Deploy muvaffaqiyatli yakunlanadi va do'koningiz to'liq ishga tushadi:
   👉 `https://nasiyago-store.vercel.app`

---

## 4-QADAM: Tekshirish va Admin Panelga Kirish

- Do'kon sahifasi: `https://nasiyago-store.vercel.app/uz`
- Admin panel: `https://nasiyago-store.vercel.app/admin`
  - **Login:** `admin@nasiyago.uz`
  - **Parol:** `admin123`

### Sizning afzalliklaringiz:
✅ **Server xarajatisiz:** Vercel va Supabase bepul tarifida (Free Tier) bemalol ishlaydi.  
✅ **Avtomatik WebP & CDN:** Yuklangan barcha rasmlar to'g'ridan-to'g'ri Supabase Storage'ga tushadi va butun dunyo bo'ylab tez ochiladi.  
✅ **Cheksiz masshtablash:** Ma'lumotlar bazasi Supabase PostgreSQL bulutida xavfsiz saqlanadi.
