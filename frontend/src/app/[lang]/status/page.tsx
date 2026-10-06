'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, FileCheck, CheckCircle2, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import { formatSom } from '../../../lib/currency';
import { fetchApi } from '../../../lib/api';
import { getDictionary, Locale } from '../../../lib/i18n';

export default function OrderStatusPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;
  const t = getDictionary(lang);
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState(searchParams.get('phone') || '+998 ');
  const [appNumber, setAppNumber] = useState(searchParams.get('applicationNumber') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) val = '+998 ';
    setPhone(val);
  };

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setResult(null);

    const cleanAppNum = appNumber.trim();
    if (!cleanAppNum) {
      setError('Ariza raqamini kiriting (masalan: NG-2026-1001)');
      return;
    }

    try {
      setLoading(true);
      const res = await fetchApi(`/api/v1/applications/status?phone=${encodeURIComponent(phone)}&applicationNumber=${encodeURIComponent(cleanAppNum)}`);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Ariza topilmadi');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if query params exist
  useEffect(() => {
    if (searchParams.get('applicationNumber')) {
      handleCheck();
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Yangi ariza</span>;
      case 'IN_REVIEW':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Koʻrib chiqilmoqda</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Tasdiqlandi</span>;
      case 'DELIVERED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Yetkazildi</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Bekor qilindi</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
          <FileCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t.status.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.status.subtitle}
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Telefon raqamingiz
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+998 (90) 123-45-67"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-semibold outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Ariza raqami
            </label>
            <input
              type="text"
              required
              value={appNumber}
              onChange={(e) => setAppNumber(e.target.value.toUpperCase())}
              placeholder="Masalan: NG-2026-1001"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-mono font-bold outline-none transition text-sm uppercase"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-extrabold text-sm transition shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Qidirilmoqda...' : t.status.checkButton}</span>
          </button>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Ariza raqami:</span>
              <div className="text-xl font-black text-slate-900 tracking-wider">
                #{result.applicationNumber}
              </div>
            </div>
            <div>{getStatusBadge(result.status)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Mijoz:</span>
              <div className="font-bold text-slate-800 text-sm">{result.customerName}</div>
            </div>
            <div>
              <span className="text-slate-400">Tuman:</span>
              <div className="font-bold text-slate-800 text-sm">{result.district}</div>
            </div>
            <div>
              <span className="text-slate-400">Oylik toʻlov:</span>
              <div className="font-black text-brand-600 text-base">
                {formatSom(result.monthlyPayment)} / oy
              </div>
            </div>
            <div>
              <span className="text-slate-400">Nasiya muddati:</span>
              <div className="font-bold text-slate-800 text-sm">{result.termMonths} oy</div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-2">
              Buyurtma qilingan gadjet:
            </span>
            {result.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-xs font-semibold text-slate-800">
                <span>{item.productNameUz}</span>
                <span className="text-slate-500">{item.variantColorUz} • {item.memoryRom}</span>
              </div>
            ))}
          </div>

          {/* History Timeline */}
          {result.history?.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block mb-3">
                Holat tarixi:
              </span>
              <div className="space-y-3">
                {result.history.map((h: any, i: number) => (
                  <div key={i} className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{h.comment || h.status}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(h.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
