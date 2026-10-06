'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Phone,
  MapPin,
  Clock,
  Send,
  Layers,
  FileCheck,
  Scale,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { getDictionary, Locale } from '../lib/i18n';
import { fetchApi } from '../lib/api';
import { formatSom } from '../lib/currency';

interface NavbarProps {
  lang: Locale;
}

export const Navbar: React.FC<NavbarProps> = ({ lang }) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = getDictionary(lang);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>({
    site_name: 'NasiyaGo Electronics',
    logo_url: null,
    phone_hotline: '+998 71 200 44 00',
    telegram_channel: 'https://t.me/nasiyago_uz',
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Load public brand settings
  useEffect(() => {
    fetchApi('/api/v1/settings')
      .then((data) => {
        if (data && data.site_name) {
          setSettings(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Switch locale while preserving pathname
  const switchLocale = (newLocale: Locale) => {
    if (newLocale === lang) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/') || `/${newLocale}`);
  };

  // Instant search debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await fetchApi<any[]>(`/api/v1/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>{t.city} (3 soatda bepul yetkazish)</span>
            </span>
            <span className="hidden sm:flex items-center space-x-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>09:00 - 21:00</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={settings.telegram_channel || "https://t.me/nasiyago_uz"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:text-white transition"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Telegram kanal</span>
            </a>
            <a
              href={`tel:${settings.phone_hotline.replace(/[^0-9+]/g, '')}`}
              className="flex items-center space-x-1 font-semibold text-white hover:text-brand-300 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{settings.phone_hotline || t.hotline}</span>
            </a>

            {/* Language Switcher */}
            <div className="flex items-center border border-slate-700 rounded overflow-hidden text-xs font-semibold">
              <button
                onClick={() => switchLocale('uz')}
                className={`px-2 py-0.5 transition ${lang === 'uz' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                UZ
              </button>
              <button
                onClick={() => switchLocale('ru')}
                className={`px-2 py-0.5 transition ${lang === 'ru' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                RU
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link href={`/${lang}`} className="flex items-center space-x-2.5 flex-shrink-0 group">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.site_name}
                className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200 group-hover:scale-105 transition transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition transform">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            )}
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                <span>{settings.site_name}</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 -mt-1">
                Bank aralashuvisiz • Nasiya
              </p>
            </div>
          </Link>

          {/* Catalog Button */}
          <Link
            href={`/${lang}/catalog`}
            className="hidden md:flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>{t.nav.catalog}</span>
          </Link>

          {/* Search Bar with live suggestions */}
          <div ref={searchRef} className="relative flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Topilgan gadjetlar
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/${lang}/product/${item.slug}`}
                      onClick={() => setSuggestions([])}
                      className="flex items-center space-x-3 p-3 hover:bg-slate-50 transition"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.nameUz}
                          className="w-10 h-10 object-contain rounded-lg bg-slate-100 p-1 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          {lang === 'ru' ? item.nameRu : item.nameUz}
                        </div>
                        <div className="text-xs font-bold text-brand-600">
                          {formatSom(item.basePrice)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-5">
            <Link
              href={`/${lang}/status`}
              className="flex items-center space-x-1.5 text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.nav.orderStatus}</span>
            </Link>

            <Link
              href={`/${lang}/compare`}
              className="flex items-center space-x-1.5 text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
            >
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>{t.nav.compare}</span>
            </Link>

            <Link
              href={`/${lang}/terms`}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
            >
              {t.nav.installmentTerms}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-slate-100 mt-3 space-y-2">
            <Link
              href={`/${lang}/catalog`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-brand-50 text-brand-700 font-semibold text-sm"
            >
              <Layers className="w-4 h-4" />
              <span>{t.nav.catalog}</span>
            </Link>
            <Link
              href={`/${lang}/status`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-sm"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.nav.orderStatus}</span>
            </Link>
            <Link
              href={`/${lang}/compare`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-sm"
            >
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>{t.nav.compare}</span>
            </Link>
            <Link
              href={`/${lang}/terms`}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-sm"
            >
              {t.nav.installmentTerms}
            </Link>
            <Link
              href={`/${lang}/stores`}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-sm"
            >
              {t.nav.stores}
            </Link>
            <Link
              href={`/${lang}/contacts`}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-sm"
            >
              {t.nav.contacts}
            </Link>
          </div>
        )}
      </div>

      {/* Categories Fast Bar */}
      <div className="bg-slate-50 border-t border-slate-200/70 py-2 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center space-x-6 text-xs font-semibold text-slate-600 whitespace-nowrap">
          <Link href={`/${lang}/catalog?category=smartphones`} className="hover:text-brand-600 transition">
            📱 {t.nav.smartphones}
          </Link>
          <Link href={`/${lang}/catalog?category=tablets`} className="hover:text-brand-600 transition">
            📟 {t.nav.tablets}
          </Link>
          <Link href={`/${lang}/catalog?category=laptops`} className="hover:text-brand-600 transition">
            💻 {t.nav.laptops}
          </Link>
          <Link href={`/${lang}/catalog?category=accessories`} className="hover:text-brand-600 transition">
            🎧 {t.nav.accessories}
          </Link>
          <Link href={`/${lang}/catalog?brand=apple`} className="text-slate-800 hover:text-brand-600 transition">
            🍏 Apple
          </Link>
          <Link href={`/${lang}/catalog?brand=samsung`} className="text-slate-800 hover:text-brand-600 transition">
            🔵 Samsung
          </Link>
          <Link href={`/${lang}/catalog?brand=xiaomi`} className="text-slate-800 hover:text-brand-600 transition">
            🟠 Xiaomi
          </Link>
          <Link href={`/${lang}/catalog?brand=honor`} className="text-slate-800 hover:text-brand-600 transition">
            🔷 Honor
          </Link>
        </div>
      </div>
    </header>
  );
};
