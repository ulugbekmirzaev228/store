import React from 'react';
import Link from 'next/link';
import { Truck, Clock, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { Locale, getDictionary } from '../../../lib/i18n';

export default function DeliveryPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;
  const t = getDictionary(lang);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          Yetkazib berish xizmati
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Toshkent shahri boʻylab 3 soat ichida tezkor va xavfsiz bepul yetkazib beramiz.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <Clock className="w-6 h-6 text-brand-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">3 soat ichida</h3>
            <p className="text-xs text-slate-500 mt-1">Ariza tasdiqlangandan soʻng kuryer tezda yetkazadi.</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">0 soʻm (Bepul)</h3>
            <p className="text-xs text-slate-500 mt-1">Toshkent shahar chegarasi boʻylab yetkazish bepul.</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <MapPin className="w-6 h-6 text-indigo-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Doʻkondan olib ketish</h3>
            <p className="text-xs text-slate-500 mt-1">Chilonzor, Yunusobod va Malika filiallarimizdan.</p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">Yetkazib berish jarayoni qanday kechadi?</h2>
          <ol className="list-decimal pl-4 space-y-2 text-xs sm:text-sm text-slate-600">
            <li>Siz saytimizda ariza qoldirasiz va oʻzingizga maʼqul toʻlov muddatini tanlaysiz.</li>
            <li>Operatorimiz 15 daqiqa ichida qoʻngʻiroq qilib, maʼlumotlarni tasdiqlaydi.</li>
            <li>Kuryer buyurtmani maxsus muhrlangan qadoqda yetkazib beradi va joyida shartnoma imzolanadi.</li>
            <li>Qurilmani toʻliq tekshirib olasiz va uning ishlashiga ishonch hosil qilasiz.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
