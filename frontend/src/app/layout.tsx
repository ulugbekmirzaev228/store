import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NasiyaGo Electronics — Toshkentda bank aralashuvisiz muddatli toʻlov',
  description: 'Smartfonlar va gadjetlar 0% boshlangʻich toʻlov bilan. Pasport orqali 15 daqiqada tasdiqlash va Toshkent boʻylab 3 soatda bepul yetkazish.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="min-h-screen flex flex-col antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
