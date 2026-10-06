'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatSom } from '../lib/currency';
import { Locale } from '../lib/i18n';

interface ProductCardProps {
  product: {
    id: string;
    nameUz: string;
    nameRu: string;
    slug: string;
    basePrice: number;
    isHit?: boolean;
    isNew?: boolean;
    brand?: { name: string };
    primaryImage?: string | null;
    secondaryImage?: string | null;
    minMonthlyPayment?: number;
  };
  lang: Locale;
  onQuickApply?: (product: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, lang, onQuickApply }) => {
  const name = lang === 'ru' ? product.nameRu : product.nameUz;
  const monthly = product.minMonthlyPayment || Math.round((product.basePrice * 1.28) / 12);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isHit && (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
            HIT
          </span>
        )}
        {product.isNew && (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
            YANGI
          </span>
        )}
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          0% Boshlangʻich
        </span>
      </div>

      {/* Product Image */}
      <Link href={`/${lang}/product/${product.slug}`} className="block relative pt-4 px-3 sm:pt-6 sm:px-6 pb-2 sm:pb-4 bg-slate-50/50">
        <div className="w-full h-36 sm:h-52 flex items-center justify-center p-1 sm:p-2">
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
              Rasm yoʻq
            </div>
          )}
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 sm:mb-1">
            {product.brand?.name || 'Gadjet'}
          </div>
          <Link
            href={`/${lang}/product/${product.slug}`}
            className="font-bold text-slate-900 text-xs sm:text-base line-clamp-2 hover:text-brand-600 transition leading-snug"
          >
            {name}
          </Link>
        </div>

        {/* Pricing Blocks */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100">
          {/* Monthly Payment Tag */}
          <div className="bg-brand-50/90 border border-brand-100 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 mb-2 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-brand-700">Oylik:</span>
            <span className="text-xs sm:text-sm font-black text-brand-700">
              {formatSom(monthly)}/oy
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs text-slate-400">Naqd:</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-800">
              {formatSom(product.basePrice)}
            </span>
          </div>

          {/* Action CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onQuickApply ? onQuickApply(product) : null}
              className="w-full py-2 sm:py-2.5 px-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-extrabold text-xs text-center transition shadow-sm"
            >
              Nasiyaga olish
            </button>
            <Link
              href={`/${lang}/product/${product.slug}`}
              className="hidden sm:flex py-2 sm:py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs items-center justify-center space-x-1"
            >
              <span>Batafsil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
