'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { InstallmentCalculator } from '../../../../components/InstallmentCalculator';
import { ApplicationModal } from '../../../../components/ApplicationModal';
import { StickyMobileCTA } from '../../../../components/StickyMobileCTA';
import { ProductCard } from '../../../../components/ProductCard';
import { formatSom } from '../../../../lib/currency';
import { fetchApi } from '../../../../lib/api';
import { getDictionary, Locale } from '../../../../lib/i18n';

export default function ProductDetailPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;
  const t = getDictionary(lang);

  const [data, setData] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Application Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [calcSummary, setCalcSummary] = useState<{
    termMonths: number;
    downPaymentAmount: number;
    monthlyPayment: number;
    totalPrice: number;
  }>({
    termMonths: 12,
    downPaymentAmount: 0,
    monthlyPayment: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetchApi(`/api/v1/products/${params.slug}`);
        setData(res);

        if (res.product?.variants?.length > 0) {
          const defaultVar = res.product.variants.find((v: any) => v.isDefault) || res.product.variants[0];
          setSelectedVariant(defaultVar);
          setCalcSummary({
            termMonths: 12,
            downPaymentAmount: 0,
            monthlyPayment: Math.round((defaultVar.price * 1.28) / 12),
            totalPrice: Math.round(defaultVar.price * 1.28),
          });
        }

        if (res.product?.images?.length > 0) {
          setActiveImage(res.product.images[0].imageUrl);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-white rounded-3xl border border-slate-200" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-6 w-1/3 bg-slate-200 rounded-lg" />
            <div className="h-48 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Mahsulot topilmadi</h2>
        <Link
          href={`/${lang}/catalog`}
          className="mt-4 inline-block py-2.5 px-5 rounded-xl bg-brand-600 text-white font-bold text-xs"
        >
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  const { product, installmentOptions, similarProducts } = data;
  const productName = lang === 'ru' ? product.nameRu : product.nameUz;
  const currentPrice = selectedVariant?.price || product.basePrice;

  const handleCalculatorApply = (
    termMonths: number,
    downPaymentAmount: number,
    monthlyPayment: number,
    totalPrice: number
  ) => {
    setCalcSummary({ termMonths, downPaymentAmount, monthlyPayment, totalPrice });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-28 sm:pb-8 space-y-8 sm:space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
        <Link href={`/${lang}`} className="hover:text-brand-600">Bosh sahifa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${lang}/catalog`} className="hover:text-brand-600">{t.nav.catalog}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${lang}/catalog?brand=${product.brand.slug}`} className="hover:text-brand-600">
          {product.brand.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-bold truncate max-w-xs">{productName}</span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Gallery Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-center h-[340px] sm:h-[420px] shadow-sm relative overflow-hidden">
            {activeImage ? (
              <img
                src={activeImage}
                alt={productName}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-slate-400 text-sm">Rasm yoʻq</div>
            )}

            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.isHit && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                  HIT
                </span>
              )}
              {product.isNew && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                  YANGI
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto py-1">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={`w-16 h-16 rounded-xl border-2 p-1 bg-white flex-shrink-0 transition ${
                    activeImage === img.imageUrl ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Perks Pill */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center space-x-2.5">
              <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-slate-800">3 soatda yetkazish</div>
                <div className="text-[10px] text-slate-400">Toshkent boʻylab bepul</div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-slate-800">1 yil rasmiy kafolat</div>
                <div className="text-[10px] text-slate-400">Doʻkon tomonidan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration & Details Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-brand-600 mb-1">
              {product.brand.name} • {lang === 'ru' ? product.category.nameRu : product.category.nameUz}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {productName}
            </h1>
          </div>

          {/* Cash Price vs In-Stock */}
          <div className="flex items-baseline justify-between py-3 border-y border-slate-200/80">
            <div>
              <span className="text-xs text-slate-400 font-medium">Naqd toʻlov narxi:</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatSom(currentPrice)}
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {selectedVariant?.stock > 0 ? `${t.product.inStock} (${selectedVariant.stock} dona)` : t.product.outOfStock}
            </span>
          </div>

          {/* Variant Selector: Memory & Color */}
          {product.variants?.length > 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Variantni tanlang:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedVariant?.id === v.id
                          ? 'border-brand-600 bg-brand-50/50 shadow-sm ring-1 ring-brand-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0"
                          style={{ backgroundColor: v.colorCode || '#000000' }}
                        />
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {v.colorUz}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mt-1">
                        {v.memoryRom} {v.memoryRam ? `• ${v.memoryRam}` : ''}
                      </div>
                      <div className="text-xs font-black text-brand-600 mt-1">
                        {formatSom(v.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INSTALLMENT CALCULATOR (THE HEART OF THE CONVERSION FLOW) */}
          <InstallmentCalculator
            price={currentPrice}
            productName={productName}
            lang={lang}
            customMarkupPercent={product.customMarkupPercent}
            onApplyClick={handleCalculatorApply}
          />
        </div>
      </div>

      {/* Technical Specs & Description Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
          {t.product.specs} va Tavsif
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Specs Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">
              Texnik koʻrsatkichlar
            </h3>
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              {product.specs?.map((s: any) => (
                <div key={s.id} className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    {lang === 'ru' ? s.labelRu : s.labelUz}
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {lang === 'ru' ? s.valueRu : s.valueUz}
                  </span>
                </div>
              ))}
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Holati</span>
                <span className="font-bold text-emerald-600">
                  {selectedVariant?.condition === 'NEW' ? 'Yangi (100% original)' : 'Ishlatilgan (Ideal)'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Kafolat muddati</span>
                <span className="font-bold text-slate-900">12 oy rasmiy servis kafolati</span>
              </div>
            </div>
          </div>

          {/* Description (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Mahsulot haqida
            </h3>
            <p>{lang === 'ru' ? product.descriptionRu : product.descriptionUz}</p>
          </div>
        </div>
      </div>

      {/* Similar Gadgets */}
      {similarProducts?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {t.product.similar}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similarProducts.map((p: any) => (
              <ProductCard
                key={p.id}
                product={p}
                lang={lang}
                onQuickApply={() => {
                  setSelectedVariant({ id: p.id, colorUz: 'Standart', price: p.basePrice });
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom CTA for Mobile screens */}
      <StickyMobileCTA
        price={currentPrice}
        monthlyPayment={calcSummary.monthlyPayment || Math.round((currentPrice * 1.28) / 12)}
        termMonths={calcSummary.termMonths || 12}
        onApplyClick={() => setIsModalOpen(true)}
      />

      {/* Checkout / Application Modal */}
      {selectedVariant && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          selectedVariant={selectedVariant}
          initialTermMonths={calcSummary.termMonths}
          initialDownPayment={calcSummary.downPaymentAmount}
          initialMonthlyPayment={calcSummary.monthlyPayment}
          initialTotalPrice={calcSummary.totalPrice}
          lang={lang}
        />
      )}
    </div>
  );
}
