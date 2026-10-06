'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, MapPin, Clock, Send, Instagram, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { getDictionary, Locale } from '../lib/i18n';
import { fetchApi } from '../lib/api';

interface FooterProps {
  lang: Locale;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = getDictionary(lang);
  const [settings, setSettings] = useState<any>({
    site_name: 'NasiyaGo Electronics',
    phone_hotline: '+998 71 200 44 00',
    telegram_channel: 'https://t.me/nasiyago_uz',
    instagram: 'https://instagram.com/nasiyago_uz',
  });

  useEffect(() => {
    fetchApi('/api/v1/settings')
      .then((data) => {
        if (data && data.site_name) setSettings(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-16 border-t border-slate-800">
      {/* Advantage Badges */}
      <div className="border-b border-slate-800/80 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Bank aralashuvisiz</h4>
              <p className="text-xs text-slate-400 mt-0.5">Toʻgʻridan-toʻgʻri doʻkon hisobidan nasiya</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">3 soatda yetkazish</h4>
              <p className="text-xs text-slate-400 mt-0.5">Toshkent boʻylab tezkor kuryer xizmati</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">0% Boshlangʻich toʻlov</h4>
              <p className="text-xs text-slate-400 mt-0.5">Oldindan pul toʻlamasdan xarid qiling</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">15 daqiqada tasdiqlash</h4>
              <p className="text-xs text-slate-400 mt-0.5">Faqat pasport yoki ID karta bilan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="text-2xl font-black text-white flex items-center gap-1">
            <span>{settings.site_name}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            {t.tagline}. Smartfonlar, noutbuklar va gadjetlarni hech qanday bank navbatlarisiz, qulay oylik toʻlovlarga xarid qiling.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <a
              href={settings.telegram_channel || "https://t.me/nasiyago_uz"}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-brand-600 text-white flex items-center justify-center transition border border-slate-800"
            >
              <Send className="w-4 h-4" />
            </a>
            <a
              href={settings.instagram || "https://instagram.com/nasiyago_uz"}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-pink-600 text-white flex items-center justify-center transition border border-slate-800"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links: Katalog */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Katalog</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={`/${lang}/catalog?brand=apple`} className="hover:text-white transition">
                Apple iPhone
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/catalog?brand=samsung`} className="hover:text-white transition">
                Samsung Galaxy
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/catalog?brand=xiaomi`} className="hover:text-white transition">
                Xiaomi & Redmi
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/catalog?brand=honor`} className="hover:text-white transition">
                Honor smartfonlari
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/catalog?category=laptops`} className="hover:text-white transition">
                Noutbuklar & MacBook
              </Link>
            </li>
          </ul>
        </div>

        {/* Links: Xaridorlarga */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Xaridorlarga</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={`/${lang}/terms`} className="hover:text-white transition">
                Nasiya shartlari
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/status`} className="hover:text-white transition">
                Ariza holatini tekshirish
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/delivery`} className="hover:text-white transition">
                Yetkazib berish
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/stores`} className="hover:text-white transition">
                Filiallar va doʻkonlar
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/compare`} className="hover:text-white transition">
                Gadjetlarni taqqoslash
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Bogʻlanish</h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <a href="tel:+998712004400" className="text-white font-semibold hover:text-brand-300">
                {t.hotline}
              </a>
            </li>
            <li className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <span>Toshkent sh., Bunyodkor shoh koʻchasi 42</span>
            </li>
            <li className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>09:00 - 21:00 (Dam olish kunlarisiz)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-slate-900 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 NasiyaGo Electronics LLC. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center space-x-4">
            <Link href={`/${lang}/terms`} className="hover:text-slate-400">
              Ommaviy oferta
            </Link>
            <Link href="/admin/login" className="hover:text-brand-400 transition">
              Xodimlar kirishi (Admin)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
