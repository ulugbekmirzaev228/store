'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, FileCheck, Scale, PhoneCall } from 'lucide-react';
import { Locale } from '../lib/i18n';

interface MobileBottomNavProps {
  lang: Locale;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ lang }) => {
  const pathname = usePathname();

  // Don't show bottom nav in admin routes
  if (pathname.includes('/admin')) return null;

  const navItems = [
    { label: 'Asosiy', href: `/${lang}`, icon: Home, exact: true },
    { label: 'Katalog', href: `/${lang}/catalog`, icon: Layers },
    { label: 'Holat', href: `/${lang}/status`, icon: FileCheck },
    { label: 'Taqqoslash', href: `/${lang}/compare`, icon: Scale },
    { label: 'Doʻkonlar', href: `/${lang}/stores`, icon: PhoneCall },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 py-1.5 px-2 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
                isActive ? 'text-brand-600 font-black' : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
