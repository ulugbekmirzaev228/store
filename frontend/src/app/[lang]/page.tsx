'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  PhoneCall,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  ChevronRight,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';
import { ApplicationModal } from '../../components/ApplicationModal';
import { fetchApi } from '../../lib/api';
import { getDictionary, Locale } from '../../lib/i18n';

export default function HomePage({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;
  const t = getDictionary(lang);

  const [banners, setBanners] = useState<any[]>([]);
  const [hits, setHits] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'hits' | 'new'>('hits');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Application Modal state
  const [selectedProductForModal, setSelectedProductForModal] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingProducts(true);
        const [bannersData, featuredData, brandsData] = await Promise.all([
          fetchApi('/api/v1/banners').catch(() => []),
          fetchApi('/api/v1/products/featured/hits-and-new').catch(() => ({ hits: [], newArrivals: [] })),
          fetchApi('/api/v1/brands').catch(() => []),
        ]);

        let hitsList = featuredData.hits || [];
        let newArrivalsList = featuredData.newArrivals || [];

        // Fallback: If hits or newArrivals are empty, fetch recent products
        if (hitsList.length === 0 || newArrivalsList.length === 0) {
          try {
            const allProds = await fetchApi('/api/v1/products?limit=16');
            if (allProds?.items?.length > 0) {
              if (hitsList.length === 0) hitsList = allProds.items.slice(0, 8);
              if (newArrivalsList.length === 0) newArrivalsList = allProds.items.slice(0, 8);
            }
          } catch (_) {}
        }

        setBanners(bannersData);
        setHits(hitsList);
        setNewArrivals(newArrivalsList);
        setBrands(brandsData);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadData();
  }, []);

  const handleQuickApply = (product: any) => {
    setSelectedProductForModal(product);
    setIsModalOpen(true);
  };

  const faqItems = [
    {
      qUz: "Nasiyaga xarid qilish uchun qanday hujjatlar talab qilinadi?",
      qRu: "Какие документы нужны для оформления рассрочки?",
      aUz: "Faqatgina Oʻzbekiston fuqarosi pasporti yoki ID-kartasi talab qilinadi. Hech qanday daromad toʻgʻrisida maʼlumotnoma yoki kafil shart emas.",
      aRu: "Требуется только паспорт гражданина Узбекистана или ID-карта. Справки о доходах или поручители не нужны.",
    },
    {
      qUz: "Bank orqali tekshiruv boʻladimi?",
      qRu: "Оформление идет через банк?",
      aUz: "Yoʻq! Bizning kompaniyamiz oʻz mablagʻlari hisobidan toʻgʻridan-toʻgʻri nasiya beradi. Bank foizlari yoki ortiqcha komissiyalar yoʻq.",
      aRu: "Нет! Наша компания предоставляет прямую рассрочку за счет собственных средств магазина, без участия банков.",
    },
    {
      qUz: "Toshkent boʻylab yetkazib berish qancha vaqt oladi?",
      qRu: "Сколько времени занимает доставка по Ташкенту?",
      aUz: "Arizangiz tasdiqlanganidan soʻng, 3 soat ichida Toshkent shahrining istalgan manziliga kuryerimiz bepul yetkazib beradi.",
      aRu: "После подтверждения заявки курьер бесплатно доставит товар по любому адресу в Ташкенте в течение 3 часов.",
    },
    {
      qUz: "Boshlangʻich toʻlovsiz olsa boʻladimi?",
      qRu: "Можно ли взять без первоначального взноса?",
      aUz: "Ha, deyarli barcha modellarni 0% boshlangʻich toʻlov bilan 3, 6, 9 yoki 12 oyga rasmiylashtirishingiz mumkin.",
      aRu: "Да, практически все модели доступны с первоначальным взносом 0% на срок 3, 6, 9 или 12 месяцев.",
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO BANNER SECTION */}
      <section className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl p-6 sm:p-12 lg:p-16 border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs sm:text-sm font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>0% Boshlangʻich toʻlov • Bank aralashuvisiz</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Smartfonlar <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400">
                qulay nasiyaga
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {t.home.heroSubtitle}. Pasportingiz bilan 15 daqiqada tasdiqlating va bugunoq yangi smartfoningizdan foydalaning.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/${lang}/catalog`}
                className="py-3.5 px-7 rounded-2xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-extrabold text-sm sm:text-base transition shadow-lg shadow-brand-600/30 flex items-center space-x-2"
              >
                <span>Katalogni koʻrish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={`/${lang}/terms`}
                className="py-3.5 px-6 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-sm sm:text-base transition border border-slate-700"
              >
                Nasiya shartlari
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Kafolatlangan mahsulot</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>15 daqiqada javob</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Toshkentda 3 soatda</span>
              </div>
            </div>
          </div>

          {/* Decorative background visual */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 lg:opacity-40 pointer-events-none overflow-hidden">
            <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-brand-500 blur-3xl" />
            <div className="absolute right-20 bottom-0 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
          </div>
        </div>
      </section>

      {/* 2. BRAND CHIPS SECTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Mashhur brendlar
          </h2>
          <Link href={`/${lang}/catalog`} className="text-xs font-bold text-brand-600 hover:text-brand-700">
            {t.home.viewAll}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href={`/${lang}/catalog?brand=apple`}
            className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand-500 shadow-sm hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <div className="font-extrabold text-slate-900 group-hover:text-brand-600 transition">
                Apple
              </div>
              <div className="text-[11px] text-slate-500">iPhone, iPad, Mac</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-700 group-hover:text-brand-600 transition">
              🍏
            </div>
          </Link>

          <Link
            href={`/${lang}/catalog?brand=samsung`}
            className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand-500 shadow-sm hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <div className="font-extrabold text-slate-900 group-hover:text-brand-600 transition">
                Samsung
              </div>
              <div className="text-[11px] text-slate-500">Galaxy S, Z, A</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-700 group-hover:text-brand-600 transition">
              🔵
            </div>
          </Link>

          <Link
            href={`/${lang}/catalog?brand=xiaomi`}
            className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand-500 shadow-sm hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <div className="font-extrabold text-slate-900 group-hover:text-brand-600 transition">
                Xiaomi
              </div>
              <div className="text-[11px] text-slate-500">Xiaomi, Redmi, Pad</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-700 group-hover:text-brand-600 transition">
              🟠
            </div>
          </Link>

          <Link
            href={`/${lang}/catalog?brand=honor`}
            className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand-500 shadow-sm hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <div className="font-extrabold text-slate-900 group-hover:text-brand-600 transition">
                Honor
              </div>
              <div className="text-[11px] text-slate-500">Magic, 200, X seriya</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-700 group-hover:text-brand-600 transition">
              🔷
            </div>
          </Link>
        </div>
      </section>

      {/* 3. CATEGORY TILES */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href={`/${lang}/catalog?category=smartphones`}
            className="group relative bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-slate-200 hover:border-brand-400 transition shadow-sm overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-brand-600 transition">
              {t.nav.smartphones}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Top flagmanlar</p>
          </Link>

          <Link
            href={`/${lang}/catalog?category=tablets`}
            className="group relative bg-gradient-to-br from-sky-50 to-white p-5 rounded-2xl border border-slate-200 hover:border-sky-400 transition shadow-sm overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3">
              <Tablet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-sky-600 transition">
              {t.nav.tablets}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Oʻqish va ish uchun</p>
          </Link>

          <Link
            href={`/${lang}/catalog?category=laptops`}
            className="group relative bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 transition shadow-sm overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-600 transition">
              {t.nav.laptops}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">MacBook va noutbuklar</p>
          </Link>

          <Link
            href={`/${lang}/catalog?category=accessories`}
            className="group relative bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 transition shadow-sm overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-amber-600 transition">
              {t.nav.accessories}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Quloqchin & zaryadniklar</p>
          </Link>
        </div>
      </section>

      {/* 4. HITS & NEW ARRIVALS PRODUCTS TABS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('hits')}
              className={`py-2 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition ${
                activeTab === 'hits'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔥 {t.home.hits}
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`py-2 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition ${
                activeTab === 'new'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✨ {t.home.newArrivals}
            </button>
          </div>

          <Link
            href={`/${lang}/catalog`}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>Barcha mahsulotlarni koʻrish</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200/80 shadow-sm" />
            ))}
          </div>
        ) : (activeTab === 'hits' ? hits : newArrivals).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(activeTab === 'hits' ? hits : newArrivals).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onQuickApply={handleQuickApply}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
            Hozircha mahsulotlar mavjud emas
          </div>
        )}
      </section>

      {/* 5. HOW INSTALLMENT WORKS (4 VISUAL STEPS) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-12 border border-slate-800 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Oddiy va tushunarli shartlar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              {t.home.howItWorksTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              {t.home.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-white text-base mb-1">{t.home.step1Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.home.step1Desc}</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-white text-base mb-1">{t.home.step2Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.home.step2Desc}</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-white text-base mb-1">{t.home.step3Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.home.step3Desc}</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-bold text-white text-base mb-1">{t.home.step4Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.home.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900">{t.home.faqTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.home.faqSubtitle}</p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full py-4 px-5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-800 hover:text-brand-600 transition"
              >
                <span>{lang === 'ru' ? item.qRu : item.qUz}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {lang === 'ru' ? item.aRu : item.aUz}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Application Modal */}
      {selectedProductForModal && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProductForModal(null);
          }}
          product={selectedProductForModal}
          selectedVariant={selectedProductForModal.variants?.[0] || { id: selectedProductForModal.id, colorUz: 'Standart', memoryRom: '256 GB', price: selectedProductForModal.basePrice }}
          initialTermMonths={12}
          initialMonthlyPayment={selectedProductForModal.minMonthlyPayment || Math.round((selectedProductForModal.basePrice * 1.28) / 12)}
          initialTotalPrice={Math.round(selectedProductForModal.basePrice * 1.28)}
          lang={lang}
        />
      )}
    </div>
  );
}
