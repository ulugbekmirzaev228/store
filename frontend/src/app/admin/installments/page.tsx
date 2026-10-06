'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, Percent, ShieldAlert } from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export default function AdminInstallmentsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchApi('/api/v1/admin/installment-plans')
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateMarkup = async (id: string, markupPercent: number, minDown: number, maxDown: number) => {
    try {
      await fetchApi(`/api/v1/admin/installment-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          markupPercent,
          minDownPaymentPercent: minDown,
          maxDownPaymentPercent: maxDown,
        }),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Nasiya shartlari va foizlar</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Muddatlar boʻyicha ustama foizlari (markup %) va boshlangʻich toʻlov chegaralarini boshqarish
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Oʻzgarishlar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
          💡 <b>Nasiya formulasi:</b> Har bir muddat uchun koʻrsatilgan ustama foizi mahsulotning naqd narxiga qoʻshiladi va oylarga teng taqsimlanadi. Mijoz boshlangʻich toʻlov kiritganda, ustama faqat qolgan asosiy qarz summasiga hisoblanadi.
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-black flex items-center justify-center text-xs">
                    {plan.months}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {plan.months} oylik muddatli toʻlov
                  </h3>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Minimal boshlangʻich: {plan.minDownPaymentPercent}% • Maksimal: {plan.maxDownPaymentPercent}%
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 font-semibold">Ustama:</span>
                  <input
                    type="number"
                    step="0.5"
                    defaultValue={plan.markupPercent}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        handleUpdateMarkup(plan.id, val, plan.minDownPaymentPercent, plan.maxDownPaymentPercent);
                      }
                    }}
                    className="w-16 font-black text-slate-900 text-sm outline-none text-right"
                  />
                  <span className="font-bold text-slate-700 text-xs">%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
