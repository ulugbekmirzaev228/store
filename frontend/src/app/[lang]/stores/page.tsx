'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Store, Navigation } from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { Locale, getDictionary } from '../../../lib/i18n';

export default function StoresPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;
  const t = getDictionary(lang);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetchApi('/api/v1/branches')
      .then((data) => setBranches(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          Bizning doʻkonlarimiz
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Toshkent shahrida joylashgan qulay filiallarimizga tashrif buyurib, gadjetlarni oʻzingiz koʻrib, 15 daqiqada nasiyaga rasmiylashtirishingiz mumkin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branches.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {lang === 'ru' ? b.nameRu : b.nameUz}
                </h3>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-slate-400 min-w-[60px]">Manzil:</span>
                  <span className="text-slate-800 font-medium">
                    {lang === 'ru' ? b.addressRu : b.addressUz}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>{b.workingHours}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <a href={`tel:${b.phone}`} className="font-bold text-slate-900 hover:text-brand-600">
                    {b.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <a
                href={`https://yandex.uz/maps/?pt=${b.longitude},${b.latitude}&z=16&l=map`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50 text-slate-700 hover:text-brand-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Xaritada ochish (Yandex)</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
