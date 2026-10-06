'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, DollarSign, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatSom } from '../lib/currency';
import { fetchApi } from '../lib/api';
import { Locale, getDictionary } from '../lib/i18n';

interface InstallmentCalculatorProps {
  price: number;
  productName: string;
  lang: Locale;
  customMarkupPercent?: number | null;
  onApplyClick?: (termMonths: number, downPaymentAmount: number, monthlyPayment: number, totalPrice: number) => void;
}

export const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({
  price,
  productName,
  lang,
  customMarkupPercent,
  onApplyClick,
}) => {
  const t = getDictionary(lang);

  const [termMonths, setTermMonths] = useState<number>(12);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(0);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Available term options
  const termOptions = [3, 6, 9, 12];
  const quickDownPayments = [0, 10, 20, 30, 50];

  useEffect(() => {
    let isCancelled = false;

    async function calculate() {
      try {
        setLoading(true);
        const res = await fetchApi('/api/v1/installment/calculate', {
          method: 'POST',
          body: JSON.stringify({
            price,
            termMonths,
            downPaymentPercent,
            customMarkupPercent: customMarkupPercent || undefined,
          }),
        });

        if (!isCancelled) {
          setCalculation(res);
        }
      } catch (err) {
        console.error('Calculation error:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    calculate();

    return () => {
      isCancelled = true;
    };
  }, [price, termMonths, downPaymentPercent, customMarkupPercent]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
              {t.calculator.title}
            </h3>
            <p className="text-xs text-slate-500">
              Bank aralashuvisiz, pasport orqali toʻgʻridan-toʻgʻri nasiya
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          Tezkor tasdiqlash
        </span>
      </div>

      {/* 1. Term Selector Buttons */}
      <div className="mt-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          {t.calculator.term}
        </label>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {termOptions.map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setTermMonths(months)}
              className={`py-3 px-2 rounded-xl text-center font-bold text-sm sm:text-base transition border ${
                termMonths === months
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {months} {t.calculator.months}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Down Payment Selector */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.calculator.downPayment}
          </label>
          <span className="text-sm font-bold text-slate-800">
            {downPaymentPercent}% ({formatSom(calculation?.downPaymentAmount || 0)})
          </span>
        </div>

        {/* Quick Down Payment Buttons */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {quickDownPayments.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setDownPaymentPercent(pct)}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition border ${
                downPaymentPercent === pct
                  ? 'bg-indigo-900 text-white border-indigo-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {pct === 0 ? '0%' : `${pct}%`}
            </button>
          ))}
        </div>

        {/* Interactive Slider */}
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={downPaymentPercent}
          onChange={(e) => setDownPaymentPercent(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
          <span>0% ({t.calculator.zeroDown})</span>
          <span>50%</span>
        </div>
      </div>

      {/* 3. Real-time Calculation Summary Card */}
      <div className="mt-6 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-4 border-b border-slate-200">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {t.calculator.monthlyPayment}:
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-brand-600">
              {formatSom(calculation?.monthlyPayment)}
            </span>
            <span className="text-sm font-semibold text-slate-500">/ {t.calculator.months}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div>
            <div className="text-slate-500">{t.calculator.cashPrice}:</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">{formatSom(price)}</div>
          </div>
          <div>
            <div className="text-slate-500">{t.calculator.totalPrice}:</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {formatSom(calculation?.totalPrice)}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-slate-500">{t.calculator.overpayment}:</div>
            <div className="font-bold text-emerald-600 text-sm mt-0.5">
              +{formatSom(calculation?.overpayment)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Payment Schedule Toggle */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-2 transition"
        >
          <span className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>{t.calculator.schedule}</span>
          </span>
          {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSchedule && calculation?.schedule && (
          <div className="mt-2 max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-3 bg-slate-100 px-3 py-2 font-bold text-slate-600 sticky top-0">
              <div>{t.calculator.monthCol}</div>
              <div>{t.calculator.dateCol}</div>
              <div className="text-right">{t.calculator.amountCol}</div>
            </div>
            {calculation.schedule.map((item: any) => (
              <div key={item.month} className="grid grid-cols-3 px-3 py-2 text-slate-700">
                <div className="font-semibold">{item.month}-oy</div>
                <div className="text-slate-500">{item.dueDate}</div>
                <div className="text-right font-bold text-slate-900">{formatSom(item.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Main Action Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => {
            if (onApplyClick && calculation) {
              onApplyClick(
                termMonths,
                calculation.downPaymentAmount,
                calculation.monthlyPayment,
                calculation.totalPrice
              );
            }
          }}
          className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-extrabold text-base transition shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2"
        >
          <span>{t.calculator.buyInInstallment}</span>
        </button>
      </div>
    </div>
  );
};
