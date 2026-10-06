import React from 'react';
import '../globals.css';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { Locale } from '../../lib/i18n';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;

  return (
    <>
      <Navbar lang={lang} />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <Footer lang={lang} />
      <MobileBottomNav lang={lang} />
    </>
  );
}
