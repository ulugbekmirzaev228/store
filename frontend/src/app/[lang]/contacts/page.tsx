'use client';

import React, { useState } from 'react';
import { Phone, MapPin, Clock, Send, Instagram, Mail, CheckCircle2 } from 'lucide-react';
import { Locale, getDictionary } from '../../../lib/i18n';

export default function ContactsPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;
  const t = getDictionary(lang);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900">
          Biz bilan bogʻlaning
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Savollaringiz bormi yoki nasiya shartlari boʻyicha maslahat kerakmi? Operatorlarimiz doim aloqada!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Yagona koll-markaz</div>
              <a href="tel:+998712004400" className="text-lg font-black text-slate-900 hover:text-brand-600">
                +998 71 200 44 00
              </a>
              <div className="text-xs text-slate-500 mt-0.5">Har kuni 09:00 dan 21:00 gacha</div>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Telegram qoʻllab-quvvatlash</div>
              <a href="https://t.me/nasiyago_uz" target="_blank" rel="noreferrer" className="text-sm font-bold text-sky-600 hover:underline">
                @nasiyago_uz
              </a>
              <div className="text-xs text-slate-500 mt-0.5">Tezkor savol-javoblar uchun</div>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Bosh ofis manzili</div>
              <div className="text-sm font-bold text-slate-900">
                Toshkent sh., Bunyodkor shoh koʻchasi 42 (Metro Mirzo Ulugʻbek)
              </div>
            </div>
          </div>
        </div>

        {/* Callback Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Qayta qoʻngʻiroqqa buyurtma</h2>
          <p className="text-xs text-slate-500 mb-6">
            Raqamingizni qoldiring, 10 daqiqa ichida mutaxassisimiz sizga qoʻngʻiroq qiladi.
          </p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-900 text-sm">Xabaringiz qabul qilindi!</div>
              <p className="text-xs text-slate-600">Operatorimiz tez orada siz bilan bogʻlanadi.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ismingiz</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefon raqamingiz</label>
                <input
                  type="tel"
                  required
                  defaultValue="+998 "
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Xabar yoki savolingiz</label>
                <textarea
                  rows={3}
                  placeholder="Nasiya boʻyicha savolingiz..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-sm transition shadow-md shadow-brand-500/20"
              >
                Qoʻngʻiroq soʻrash
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
