'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Watch,
  Tv,
  Speaker,
  Camera,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';

const AVAILABLE_ICONS = [
  { name: 'Smartphone', label: 'Smartfon', icon: Smartphone },
  { name: 'Tablet', label: 'Planshet', icon: Tablet },
  { name: 'Laptop', label: 'Noutbuk', icon: Laptop },
  { name: 'Headphones', label: 'Quloqchin', icon: Headphones },
  { name: 'Watch', label: 'Aqlli soat', icon: Watch },
  { name: 'Tv', label: 'Televizor', icon: Tv },
  { name: 'Speaker', label: 'Kolonka', icon: Speaker },
  { name: 'Camera', label: 'Kamera', icon: Camera },
  { name: 'Gamepad2', label: 'Oʻyin konsoli', icon: Gamepad2 },
  { name: 'Layers', label: 'Boshqa', icon: Layers },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form states
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Smartphone');
  const [order, setOrder] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/api/v1/admin/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setNameUz('');
    setNameRu('');
    setSlug('');
    setIcon('Smartphone');
    setOrder(String(categories.length + 1));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCategory(c);
    setNameUz(c.nameUz);
    setNameRu(c.nameRu || '');
    setSlug(c.slug);
    setIcon(c.icon || 'Smartphone');
    setOrder(String(c.order || 0));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (c: any) => {
    if (c._count?.products > 0) {
      alert(`Ushbu kategoriyada ${c._count.products} ta mahsulot mavjud. Uni oʻchirib boʻlmaydi.`);
      return;
    }

    if (!confirm(`Haqiqatan ham "${c.nameUz}" kategoriyasini oʻchirmoqchimisiz?`)) {
      return;
    }

    try {
      await fetchApi(`/api/v1/admin/categories/${c.id}`, { method: 'DELETE' });
      await loadCategories();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUz.trim()) {
      setErrorMsg('Kategoriya nomini kiriting');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload = {
        nameUz: nameUz.trim(),
        nameRu: nameRu.trim() || nameUz.trim(),
        slug: slug.trim() || undefined,
        icon,
        order: parseInt(order, 10) || 0,
      };

      if (editingCategory) {
        await fetchApi(`/api/v1/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/api/v1/admin/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase();
    return c.nameUz.toLowerCase().includes(q) || c.nameRu?.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  const getIconComponent = (iconName: string) => {
    const found = AVAILABLE_ICONS.find((i) => i.name === iconName);
    const IconComp = found ? found.icon : FolderTree;
    return <IconComp className="w-5 h-5 text-brand-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <FolderTree className="w-7 h-7 text-brand-600" />
            <span>Kategoriyalar boshqaruvi</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Platformadagi mahsulot kategoriyalarini qoʻshish, tahrirlash va tartiblash
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi kategoriya</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Kategoriya nomi yoki slug boʻyicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold hidden sm:block">
          Jami: <span className="text-slate-900 font-bold">{categories.length}</span> ta kategoriya
        </div>
      </div>

      {/* Categories Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">Yuklanmoqda...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">
            Kategoriyalar topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] sm:text-xs">
                <tr>
                  <th className="py-3 px-4">Belgi (Icon)</th>
                  <th className="py-3 px-4">Oʻzbekcha nomi</th>
                  <th className="py-3 px-4">Ruscha nomi</th>
                  <th className="py-3 px-4">Slug (URL)</th>
                  <th className="py-3 px-4 text-center">Tartib (Order)</th>
                  <th className="py-3 px-4 text-center">Mahsulotlar</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                        {getIconComponent(c.icon)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{c.nameUz}</td>
                    <td className="py-3 px-4 text-slate-600">{c.nameRu || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        /{c.slug}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{c.order}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Package className="w-3 h-3 mr-1" />
                        {c._count?.products || 0} dona
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Oʻchirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-black text-slate-900">
                {editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya qoʻshish'}
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
                  Kategoriya nomi (Oʻzbekcha) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameUz}
                  onChange={(e) => setNameUz(e.target.value)}
                  placeholder="Masalan: Smartfonlar yoki Quloqchinlar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategoriya nomi (Ruscha)
                </label>
                <input
                  type="text"
                  value={nameRu}
                  onChange={(e) => setNameRu(e.target.value)}
                  placeholder="Например: Смартфоны или Наушники"
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
                    placeholder="smartphones (ixtiyoriy)"
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

              {/* Icon selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Belgi (Icon) tanlash
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconC = item.icon;
                    const isSelected = icon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIcon(item.name)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition text-center ${
                          isSelected
                            ? 'bg-brand-50 border-brand-600 text-brand-700 font-bold ring-2 ring-brand-500/20'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <IconC className="w-5 h-5" />
                        <span className="text-[10px] truncate max-w-full">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'Saqlanmoqda...' : editingCategory ? 'Oʻzgarishlarni saqlash' : 'Kategoriya qoʻshish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
