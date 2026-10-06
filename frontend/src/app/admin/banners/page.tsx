'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleUz, setTitleUz] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [badgeUz, setBadgeUz] = useState('0% Boshlangʻich');
  const [linkUrl, setLinkUrl] = useState('/catalog');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const loadBanners = () => {
    fetchApi('/api/v1/banners').then(setBanners).catch(console.error);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleUz || !imageUrl) return;

    try {
      setLoading(true);
      await fetchApi('/api/v1/admin/banners', {
        method: 'POST',
        body: JSON.stringify({
          titleUz,
          titleRu: titleRu || titleUz,
          badgeUz,
          badgeRu: badgeUz,
          linkUrl,
          imageUrlDesktop: imageUrl,
          imageUrlMobile: imageUrl,
          order: banners.length + 1,
        }),
      });

      setIsModalOpen(false);
      setTitleUz('');
      setImageUrl('');
      loadBanners();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bannerni oʻchirmoqchimisiz?')) return;
    try {
      await fetchApi(`/api/v1/admin/banners/${id}`, { method: 'DELETE' });
      loadBanners();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Promo bannerlar</h1>
          <p className="text-xs text-slate-500 mt-0.5">Asosiy sahifadagi slayder va aksiyalar</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-brand-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi banner qoʻshish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <img src={b.imageUrlDesktop} alt="" className="w-full h-40 object-cover" />
              <div className="p-4 space-y-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700">
                  {b.badgeUz}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{b.titleUz}</h3>
                <div className="text-[11px] text-slate-400 font-mono">{b.linkUrl}</div>
              </div>
            </div>

            <div className="p-4 pt-0 text-right">
              <button
                onClick={() => handleDelete(b.id)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900">Yangi banner qoʻshish</h3>

            <form onSubmit={handleCreateBanner} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sarlavha (Oʻzbekcha)</label>
                <input
                  type="text"
                  required
                  value={titleUz}
                  onChange={(e) => setTitleUz(e.target.value)}
                  placeholder="iPhone 16 Pro — 0% boshlangʻich toʻlov!"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Koʻk nishon (Badge)</label>
                <input
                  type="text"
                  value={badgeUz}
                  onChange={(e) => setBadgeUz(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rasm havolasi (URL)</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yoʻnaltiriladigan havola</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  {loading ? 'Saqlanmoqda...' : 'Qoʻshish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
