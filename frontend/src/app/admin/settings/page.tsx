'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  CheckCircle2,
  Phone,
  Send,
  Instagram,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { fetchApi, getApiBaseUrl } from '../../../lib/api';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('NasiyaGo Electronics');
  const [logoUrl, setLogoUrl] = useState('');
  const [phoneHotline, setPhoneHotline] = useState('+998 71 200 44 00');
  const [telegramChannel, setTelegramChannel] = useState('https://t.me/nasiyago_uz');
  const [instagram, setInstagram] = useState('https://instagram.com/nasiyago_uz');
  const [requirePassport, setRequirePassport] = useState(false);
  const [freeDeliveryTashkent, setFreeDeliveryTashkent] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    fetchApi('/api/v1/admin/settings')
      .then((settings) => {
        if (settings.site_name) setSiteName(settings.site_name);
        if (settings.logo_url) setLogoUrl(settings.logo_url);
        if (settings.phone_hotline) setPhoneHotline(settings.phone_hotline);
        if (settings.telegram_channel) setTelegramChannel(settings.telegram_channel);
        if (settings.instagram) setInstagram(settings.instagram);
        if (settings.require_passport !== undefined) setRequirePassport(settings.require_passport === 'true');
        if (settings.free_delivery_tashkent !== undefined) setFreeDeliveryTashkent(settings.free_delivery_tashkent === 'true');
      })
      .catch((err) => console.error('Error fetching settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('nasiyago_admin_token');
      const apiUrl = getApiBaseUrl();

      const res = await fetch(`${apiUrl}/api/v1/admin/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Rasm yuklashda xatolik');
      const data = await res.json();
      setLogoUrl(data.url);
    } catch (err: any) {
      alert(err.message || 'Logotip yuklashda xatolik yuz berdi');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await fetchApi('/api/v1/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          site_name: siteName,
          logo_url: logoUrl,
          phone_hotline: phoneHotline,
          telegram_channel: telegramChannel,
          instagram: instagram,
          require_passport: String(requirePassport),
          free_delivery_tashkent: String(freeDeliveryTashkent),
        }),
      });

      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Sozlamalarni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="h-96 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-600" />
          <span>Tizim va brend sozlamalari</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Platforma brend nomi, rasmiy logotipi, koll-markaz raqamlari va buyurtma parametrlarini boshqarish
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Platforma sozlamalari muvaffaqiyatli saqlandi va sayt boʻylab yangilandi!</span>
        </div>
      )}

      {/* Live Brand Preview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Eye className="w-4 h-4 text-brand-600" />
          <span>Jonli oldindan koʻrish (Sayt bosh qismida koʻrinishi):</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo preview"
                className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1 border border-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            )}
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                <span>{siteName || 'NasiyaGo Electronics'}</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-0.5">
                Bank aralashuvisiz • Toshkent
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-xs">
            <span className="font-semibold text-emerald-400">{phoneHotline}</span>
            <span className="px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
              0% Boshlangʻich
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs sm:text-sm">
        {/* Brand Information Section */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
            1. Brend va Vizual identifikatsiya
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Platforma / Doʻkon nomi
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Masalan: NasiyaGo Electronics"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Logotip havolasi (URL)
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... yoki fayldan yuklang"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Direct File Upload for Logo */}
          <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                <ImageIcon className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-xs">Yangi logotip yuklash</div>
                <div className="text-[11px] text-slate-400">PNG, SVG yoki WebP (avtomatik optimallashtiriladi)</div>
              </div>
            </div>

            <label className="cursor-pointer py-2 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition">
              <Upload className="w-3.5 h-3.5 text-brand-600" />
              <span>{uploadingLogo ? 'Yuklanmoqda...' : 'Faylni tanlash'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Contacts Section */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
            2. Aloqa va Ijtimoiy tarmoqlar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Koll-markaz telefoni
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneHotline}
                  onChange={(e) => setPhoneHotline(e.target.value)}
                  placeholder="+998 71 200 44 00"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-slate-800 font-medium"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Telegram kanal yoki bot
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={telegramChannel}
                  onChange={(e) => setTelegramChannel(e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-slate-800 text-xs"
                />
                <Send className="w-4 h-4 text-sky-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Instagram sahifasi
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-slate-800 text-xs"
                />
                <Instagram className="w-4 h-4 text-pink-500 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Business Logic Toggles */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
            3. Xizmat koʻrsatish va Buyurtma parametrlari
          </h2>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={requirePassport}
                onChange={(e) => setRequirePassport(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="font-bold text-slate-900 text-xs">
                  Pasport seriyasini saytda majburiy soʻrash
                </div>
                <div className="text-[11px] text-slate-500">
                  Faollashtirilsa, mijoz arizani yuborayotganda pasport/ID karta seriyasini kiritishi shart boʻladi.
                </div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={freeDeliveryTashkent}
                onChange={(e) => setFreeDeliveryTashkent(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="font-bold text-slate-900 text-xs">
                  Toshkent boʻylab 3 soatda bepul yetkazib berish belgisi
                </div>
                <div className="text-[11px] text-slate-500">
                  Saytdagi bannerlar va mahsulot kartalarida bepul kuryer yetkazishi aks ettiriladi.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black text-sm shadow-lg shadow-brand-500/25 transition flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
