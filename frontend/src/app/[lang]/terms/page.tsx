import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { Locale, getDictionary } from '../../../lib/i18n';

export default function TermsPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;
  const t = getDictionary(lang);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          <span>Shaffof va qonuniy muddatli toʻlov</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          Nasiya savdo shartlari (Bank aralashuvisiz)
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Biz mijozlarimizga hech qanday bank ishtirokisiz, toʻgʻridan-toʻgʻri doʻkon hisobidan qulay va halol nasiya savdo xizmatini taqdim etamiz.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-slate-700">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs">1</span>
            Mijozga qoʻyiladigan asosiy talablar
          </h2>
          <ul className="space-y-2 pl-4 list-disc text-slate-600">
            <li>Oʻzbekiston Respublikasi fuqarosi boʻlishi (amaldagi biometrik pasport yoki ID karta).</li>
            <li>Yoshi 21 dan 65 yoshgacha boʻlishi.</li>
            <li>Toshkent shahrida yoki Toshkent viloyatida doimiy/vaqtinchalik roʻyxatda turishi yoki ishlashi.</li>
            <li>Ijobiy toʻlov intizomi va rasmiy yoki norasmiy doimiy daromad manbaiga ega boʻlishi.</li>
          </ul>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs">2</span>
            Muddat va toʻlov shartlari
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Toʻlov muddatlari</div>
              <div className="text-xs text-slate-600">3 oy, 6 oy, 9 oy yoki 12 oy</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Boshlangʻich toʻlov</div>
              <div className="text-xs text-slate-600">0% dan 50% gacha (ixtiyoriy)</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            * Hisoblangan oylik toʻlov shartnoma muddati davomida qatʼiy oʻzgarmas boʻlib qoladi. Hech qanday qoʻshimcha yashirin komissiyalar, sugʻurta toʻlovlari yoki kutilmagan foizlar mavjud emas.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs">3</span>
            Toʻlovlarni amalga oshirish usullari
          </h2>
          <p className="mb-2">Oylik toʻlovlarni quyidagi qulay usullarda amalga oshirish mumkin:</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">Payme</span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">Click</span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">Uzum Bank</span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">Doʻkon kassasida naqd</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-900">Tayyormisiz?</div>
            <div className="text-xs text-slate-500">Katalogimizdan gadjet tanlang va nasiya shartlarini tekshiring.</div>
          </div>
          <Link
            href={`/${lang}/catalog`}
            className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-brand-500/20"
          >
            <span>Katalogga oʻtish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
