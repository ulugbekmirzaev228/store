'use client';

import React from 'react';
import { formatSom } from '../lib/currency';

interface StickyMobileCTAProps {
  price: number;
  monthlyPayment: number;
  termMonths: number;
  onApplyClick: () => void;
}

export const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({
  price,
  monthlyPayment,
  termMonths,
  onApplyClick,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">
            {termMonths} oyga muddatli toʻlov:
          </div>
          <div className="text-base font-black text-brand-600 leading-tight">
            {formatSom(monthlyPayment)}/oy
          </div>
          <div className="text-[10px] text-slate-500">
            Naqd: {formatSom(price)}
          </div>
        </div>

        <button
          type="button"
          onClick={onApplyClick}
          className="flex-1 max-w-[190px] py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black text-xs sm:text-sm text-center shadow-md shadow-brand-500/25 transition"
        >
          Nasiyaga olish
        </button>
      </div>
    </div>
  );
};
