'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Package,
  Upload,
  Link as LinkIcon,
  Star,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';
import { fetchApi, getApiBaseUrl } from '../../../lib/api';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState('0');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/api/v1/admin/brands');
      setBrands(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error loading brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogoUrl('');
    setIsFeatured(true);
    setOrder(String(brands.length + 1));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditingBrand(b);
    setName(b.name);
    setSlug(b.slug);
    setLogoUrl(b.logoUrl || '');
    setIsFeatured(Boolean(b.isFeatured));
    setOrder(String(b.order || 0));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('image', file);

      const apiUrl = getApiBaseUrl();
      const token = typeof window !== 'undefined' ? localStorage.getItem('nasiyago_admin_token') : null;

      const res = await fetch(`${apiUrl}/api/v1/admin/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Logotip yuklashda xatolik yuz berdi');
      }

      const data = await res.json();
      if (data.url) {
        setLogoUrl(data.url);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Logotip yuklashda xatolik');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (b: any) => {
    if (b._count?.products > 0) {
      alert(`Ushbu brendga ${b._count.products} ta mahsulot biriktirilgan. Uni oʻchirib boʻlmaydi.`);
      return;
    }

    if (!confirm(`Haqiqatan ham "${b.name}" brendini oʻchirmoqchimisiz?`)) {
      return;
    }

    try {
      await fetchApi(`/api/v1/admin/brands/${b.id}`, { method: 'DELETE' });
      await loadBrands();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Brend nomini kiriting');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        logoUrl: logoUrl.trim() || null,
        isFeatured,
        order: parseInt(order, 10) || 0,
      };

      if (editingBrand) {
        await fetchApi(`/api/v1/admin/brands/${editingBrand.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/api/v1/admin/brands', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setIsModalOpen(false);
      await loadBrands();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBrands = brands.filter((b) => {
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Award className="w-7 h-7 text-brand-600" />
            <span>Brendlar boshqaruvi</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Katalogdagi brendlarni boshqarish, logotiplarini yuklash va almashtirish
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi brend</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Brend nomi yoki slug boʻyicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold hidden sm:block">
          Jami: <span className="text-slate-900 font-bold">{brands.length}</span> ta brend
        </div>
      </div>

      {/* Brands Grid / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs sm:text-sm">
          Yuklanmoqda...
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs sm:text-sm">
          Brendlar topilmadi
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBrands.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Brand Header with Logo */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-brand-200 transition">
                    {b.logoUrl ? (
                      <img
                        src={b.logoUrl}
                        alt={b.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xl font-black text-slate-400 uppercase">
                        {b.name.slice(0, 2)}
                      </span>
                    )}
                  </div>

                  {b.isFeatured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                      Mashhur
                    </span>
                  )}
                </div>

                {/* Brand Details */}
                <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition">
                  {b.name}
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">/{b.slug}</div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center font-semibold text-slate-700">
                    <Package className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {b._count?.products || 0} ta mahsulot
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    Tartib: #{b.order}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 transition flex items-center space-x-1"
                  title="Tahrirlash / Logotip almashtirish"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Tahrirlash</span>
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Oʻchirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-brand-600" />
                <span>{editingBrand ? 'Brendni tahrirlash' : 'Yangi brend qoʻshish'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Brend nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Apple, Samsung, Dyson, Xiaomi..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Slug (URL manzili)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="apple (ixtiyoriy)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tartib raqami (Order)
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Logo Upload & Preview Section */}
              <div className="pt-2">
                <label className="block font-bold text-slate-700 mb-1.5">
                  Brend logotipi / Icon
                </label>

                <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  {/* Live Preview */}
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-slate-300" />
                    )}
                  </div>

                  {/* Upload controls */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-brand-500 hover:text-brand-600 text-slate-700 font-bold text-xs transition shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingLogo ? 'Yuklanmoqda...' : 'Fayl tanlash (SVG / PNG)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                        />
                      </label>

                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      SVG, PNG yoki WEBP formatida shaffof (transparent) rasm tavsiya etiladi.
                    </p>
                  </div>
                </div>

                {/* Alternative URL Input */}
                <div className="mt-2.5">
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Yoki toʻgʻridan-toʻgʻri rasm URL manzilini kiriting: https://..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Is Featured Checkbox */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span className="font-bold text-slate-700 text-xs">
                    Mashhur brend (Bosh sahifa va filtrda ajratib koʻrsatish)
                  </span>
                </label>
              </div>

              {/* CTA Buttons */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingLogo}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'Saqlanmoqda...' : editingBrand ? 'Oʻzgarishlarni saqlash' : 'Brend qoʻshish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
