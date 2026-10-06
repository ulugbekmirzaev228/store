'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  SlidersHorizontal,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Flame,
  Sparkles,
  Eye,
  EyeOff,
  Percent,
} from 'lucide-react';
import { fetchApi, getApiBaseUrl } from '../../../lib/api';
import { formatSom } from '../../../lib/currency';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ==================== CREATE PRODUCT STATE ====================
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createUploading, setCreateUploading] = useState(false);
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [descriptionUz, setDescriptionUz] = useState('');
  const [descriptionRu, setDescriptionRu] = useState('');
  const [colorUz, setColorUz] = useState('Titanium');
  const [memoryRom, setMemoryRom] = useState('256 GB');
  const [memoryRam, setMemoryRam] = useState('8 GB');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [isHit, setIsHit] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [customMarkupPercent, setCustomMarkupPercent] = useState('');

  // ==================== EDIT PRODUCT STATE ====================
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameUz, setEditNameUz] = useState('');
  const [editNameRu, setEditNameRu] = useState('');
  const [editBrandId, setEditBrandId] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [editDescriptionUz, setEditDescriptionUz] = useState('');
  const [editDescriptionRu, setEditDescriptionRu] = useState('');
  const [editColorUz, setEditColorUz] = useState('');
  const [editMemoryRom, setEditMemoryRom] = useState('');
  const [editMemoryRam, setEditMemoryRam] = useState('');
  const [editStock, setEditStock] = useState('0');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsHit, setEditIsHit] = useState(false);
  const [editIsNew, setEditIsNew] = useState(false);
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [editCustomMarkupPercent, setEditCustomMarkupPercent] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedBrandFilter) params.append('brandId', selectedBrandFilter);
      
      const res = await fetchApi(`/api/v1/admin/products?${params.toString()}`);
      setProducts(res.items || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    fetchApi('/api/v1/brands').then(setBrands).catch(console.error);
    fetchApi('/api/v1/categories').then(setCategories).catch(console.error);
  }, [selectedBrandFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  // Image upload helper
  const uploadImageFile = async (file: File): Promise<string> => {
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

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Rasm yuklashda xatolik');
    }

    const data = await res.json();
    return data.url;
  };

  // ==================== CREATE PRODUCT ====================
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUz || !basePrice || !brandId || !categoryId) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring');
      return;
    }

    try {
      setCreateSubmitting(true);
      await fetchApi('/api/v1/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameUz,
          nameRu: nameRu || nameUz,
          brandId,
          categoryId,
          basePrice: parseFloat(basePrice),
          descriptionUz: descriptionUz || nameUz,
          descriptionRu: descriptionRu || nameRu || nameUz,
          isPublished: true,
          isHit,
          isNew,
          customMarkupPercent: customMarkupPercent ? parseFloat(customMarkupPercent) : null,
          variants: [
            {
              sku: `SKU-${Date.now()}`,
              colorUz: colorUz || 'Standart',
              colorRu: colorUz || 'Стандарт',
              colorCode: '#25282A',
              memoryRom,
              memoryRam,
              price: parseFloat(basePrice),
              stock: parseInt(stock, 10) || 0,
            },
          ],
          images: imageUrl ? [{ imageUrl }] : [],
        }),
      });

      setIsCreateOpen(false);
      setNameUz('');
      setNameRu('');
      setBasePrice('');
      setImageUrl('');
      setDescriptionUz('');
      setDescriptionRu('');
      setStock('10');
      setIsHit(false);
      setIsNew(false);
      setCustomMarkupPercent('');

      showNotification('Yangi mahsulot muvaffaqiyatli qoʻshildi!', 'success');
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // ==================== EDIT PRODUCT ====================
  const handleOpenEdit = (p: any) => {
    setEditingId(p.id);
    setEditNameUz(p.nameUz || '');
    setEditNameRu(p.nameRu || '');
    setEditBrandId(p.brandId || brands[0]?.id || '');
    setEditCategoryId(p.categoryId || categories[0]?.id || '');
    setEditBasePrice(p.basePrice?.toString() || '');
    setEditDescriptionUz(p.descriptionUz || '');
    setEditDescriptionRu(p.descriptionRu || '');
    setEditIsHit(Boolean(p.isHit));
    setEditIsNew(Boolean(p.isNew));
    setEditIsPublished(Boolean(p.isPublished));
    setEditCustomMarkupPercent(p.customMarkupPercent ? p.customMarkupPercent.toString() : '');

    // Default variant details
    const defVariant = p.variants?.[0];
    setEditColorUz(defVariant?.colorUz || 'Standart');
    setEditMemoryRom(defVariant?.memoryRom || '');
    setEditMemoryRam(defVariant?.memoryRam || '');
    setEditStock(defVariant?.stock?.toString() || '0');

    // Primary image
    const primaryImg = p.images?.[0]?.imageUrl || '';
    setEditImageUrl(primaryImg);

    setIsEditOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editNameUz || !editBasePrice || !editBrandId || !editCategoryId) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring');
      return;
    }

    try {
      setEditSubmitting(true);
      await fetchApi(`/api/v1/admin/products/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          nameUz: editNameUz,
          nameRu: editNameRu || editNameUz,
          brandId: editBrandId,
          categoryId: editCategoryId,
          basePrice: parseFloat(editBasePrice),
          descriptionUz: editDescriptionUz,
          descriptionRu: editDescriptionRu || editDescriptionUz,
          isHit: editIsHit,
          isNew: editIsNew,
          isPublished: editIsPublished,
          customMarkupPercent: editCustomMarkupPercent ? parseFloat(editCustomMarkupPercent) : null,
          imageUrl: editImageUrl,
          colorUz: editColorUz,
          memoryRom: editMemoryRom,
          memoryRam: editMemoryRam,
          stock: parseInt(editStock, 10) || 0,
        }),
      });

      setIsEditOpen(false);
      showNotification('Mahsulot maʻlumotlari muvaffaqiyatli yangilandi!', 'success');
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Tahrirlashda xatolik yuz berdi');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" mahsulotini oʻchirmoqchimisiz?`)) return;
    try {
      await fetchApi(`/api/v1/admin/products/${id}`, { method: 'DELETE' });
      showNotification('Mahsulot oʻchirildi', 'success');
      loadProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold transition shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mahsulotlar katalogi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin boshqaruvi: mahsulotlarni yaratish, tahrirlash, narx va qoldiqlarini boshqarish (Jami: {total} ta)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (brands[0]) setBrandId(brands[0].id);
              if (categories[0]) setCategoryId(categories[0].id);
              setIsCreateOpen(true);
            }}
            className="py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-brand-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi mahsulot qoʻshish</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot nomi yoki model boʻyicha qidirish..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-brand-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none w-full sm:w-auto"
          >
            <option value="">Barcha brendlar</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => loadProducts()}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Yangilash
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rasm</th>
                <th className="py-3 px-4">Mahsulot nomi</th>
                <th className="py-3 px-4">Brend / Kategoriya</th>
                <th className="py-3 px-4">Asosiy narx</th>
                <th className="py-3 px-4">Variantlar / Qoldiq</th>
                <th className="py-3 px-4">Holat / Belgilar</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    Mahsulotlar topilmadi
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0].imageUrl}
                            alt=""
                            className="w-11 h-11 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                            Yoʻq
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{p.nameUz}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">{p.brand?.name}</span>
                        <span className="text-slate-400 block text-[10px]">{p.category?.nameUz}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-slate-900 text-sm">
                          {formatSom(p.basePrice)}
                        </div>
                        {p.customMarkupPercent && (
                          <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Ustama: +{p.customMarkupPercent}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{p.variants?.length || 1} ta variant</span>
                        <span className="text-slate-500 block text-[10px]">
                          Qoldiq: <b className={totalStock > 0 ? 'text-emerald-700' : 'text-rose-600'}>{totalStock} dona</b>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {p.isPublished ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Faol
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200">
                              Yashirilgan
                            </span>
                          )}
                          {p.isHit && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-amber-500" />
                              Xit
                            </span>
                          )}
                          {p.isNew && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              Yangi
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 rounded-xl text-brand-600 hover:text-white hover:bg-brand-600 border border-brand-200 hover:border-brand-600 transition shadow-sm font-bold flex items-center gap-1 text-[11px]"
                            title="Tahrirlash"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tahrirlash</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.nameUz)}
                            className="p-2 rounded-xl text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 transition shadow-sm"
                            title="Oʻchirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ===================== EDIT PRODUCT MODAL ===================== */}
      {/* ============================================================== */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold mb-1">
                <Edit className="w-3.5 h-3.5" />
                <span>Admin boshqaruvi</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Mahsulotni tahrirlash</h3>
              <p className="text-xs text-slate-500">Mahsulot narxi, parametrlari, qoldigʻi va rasmini oʻzgartirish</p>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              {/* Product Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomi (Oʻzbekcha) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNameUz}
                    onChange={(e) => setEditNameUz(e.target.value)}
                    placeholder="Apple iPhone 16 Pro Max"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomi (Ruscha)</label>
                  <input
                    type="text"
                    value={editNameRu}
                    onChange={(e) => setEditNameRu(e.target.value)}
                    placeholder="Apple iPhone 16 Pro Max"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Brend <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editBrandId}
                    onChange={(e) => setEditBrandId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none bg-white font-semibold text-slate-800"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategoriya <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none bg-white font-semibold text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameUz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Markup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Asosiy naqd narxi (soʻmda) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editBasePrice}
                    onChange={(e) => setEditBasePrice(e.target.value)}
                    placeholder="12500000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white outline-none focus:border-brand-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Format: {formatSom(parseFloat(editBasePrice) || 0)}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Maxsus nasiya ustama foizi (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editCustomMarkupPercent}
                    onChange={(e) => setEditCustomMarkupPercent(e.target.value)}
                    placeholder="Masalan: 12 (ixtiyoriy)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 bg-white outline-none focus:border-brand-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Standart tarifdan farqli qilib belgilash uchun
                  </div>
                </div>
              </div>

              {/* Status and Flags */}
              <div className="p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-700">Saytda koʻrinishi:</span>
                  <button
                    type="button"
                    onClick={() => setEditIsPublished(!editIsPublished)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                      editIsPublished
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {editIsPublished ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Faol (Sotuvda)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Yashirilgan (Qoralama)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1.5 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsHit}
                      onChange={(e) => setEditIsHit(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Xit mahsulot
                    </span>
                  </label>

                  <label className="flex items-center space-x-1.5 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsNew}
                      onChange={(e) => setEditIsNew(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Yangi kelgan
                    </span>
                  </label>
                </div>
              </div>

              {/* Variant Details & Stock */}
              <div className="p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-800">Standart variant va qoldiq</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rangi</label>
                    <input
                      type="text"
                      value={editColorUz}
                      onChange={(e) => setEditColorUz(e.target.value)}
                      placeholder="Natural Titanium"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Doimiy xotira (ROM)</label>
                    <input
                      type="text"
                      value={editMemoryRom}
                      onChange={(e) => setEditMemoryRom(e.target.value)}
                      placeholder="256 GB"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tezkor xotira (RAM)</label>
                    <input
                      type="text"
                      value={editMemoryRam}
                      onChange={(e) => setEditMemoryRam(e.target.value)}
                      placeholder="8 GB"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Qoldiq soni (dona)</label>
                    <input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      placeholder="15"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Product Image & Upload */}
              <div className="p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-700">Mahsulot rasmi</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {editImageUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={editImageUrl}
                        alt="Mahsulot rasmi"
                        className="w-20 h-20 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200 shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[9px]">Rasm yoʻq</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="https://... rasm havolasi"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none font-medium text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] flex items-center space-x-1.5 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{editUploading ? 'Yuklanmoqda...' : 'Fayldan rasm yuklash (WebP)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={editUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setEditUploading(true);
                              const uploadedUrl = await uploadImageFile(file);
                              setEditImageUrl(uploadedUrl);
                            } catch (err: any) {
                              alert(err.message || 'Rasm yuklashda xatolik');
                            } finally {
                              setEditUploading(false);
                            }
                          }}
                        />
                      </label>
                      {editImageUrl && (
                        <button
                          type="button"
                          onClick={() => setEditImageUrl('')}
                          className="text-[11px] font-bold text-rose-500 hover:underline"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Tavsif (Oʻzbekcha)</label>
                <textarea
                  rows={2}
                  value={editDescriptionUz}
                  onChange={(e) => setEditDescriptionUz(e.target.value)}
                  placeholder="Mahsulot haqida qisqacha maʻlumot..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center space-x-2 shadow-md shadow-brand-500/25 transition active:scale-95 disabled:opacity-50"
                >
                  {editSubmitting ? (
                    <span>Saqlanmoqda...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Oʻzgarishlarni saqlash</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ==================== CREATE PRODUCT MODAL ==================== */}
      {/* ============================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold mb-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Admin boshqaruvi</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Yangi mahsulot qoʻshish</h3>
              <p className="text-xs text-slate-500">Katalogga yangi smartfon yoki gadjet kiritish</p>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomi (Oʻzbekcha) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameUz}
                    onChange={(e) => setNameUz(e.target.value)}
                    placeholder="Samsung Galaxy S24 Ultra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomi (Ruscha)</label>
                  <input
                    type="text"
                    value={nameRu}
                    onChange={(e) => setNameRu(e.target.value)}
                    placeholder="Samsung Galaxy S24 Ultra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Brend <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none bg-white font-semibold text-slate-800"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategoriya <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none bg-white font-semibold text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameUz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Asosiy naqd narxi (soʻmda) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="14200000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white outline-none focus:border-brand-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Format: {formatSom(parseFloat(basePrice) || 0)}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Maxsus ustama foizi (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customMarkupPercent}
                    onChange={(e) => setCustomMarkupPercent(e.target.value)}
                    placeholder="Masalan: 10 (ixtiyoriy)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 bg-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-800">Variant va qoldiq</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rangi</label>
                    <input
                      type="text"
                      value={colorUz}
                      onChange={(e) => setColorUz(e.target.value)}
                      placeholder="Titanium Black"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ROM</label>
                    <input
                      type="text"
                      value={memoryRom}
                      onChange={(e) => setMemoryRom(e.target.value)}
                      placeholder="256 GB"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">RAM</label>
                    <input
                      type="text"
                      value={memoryRam}
                      onChange={(e) => setMemoryRam(e.target.value)}
                      placeholder="12 GB"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Qoldiq (dona)</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-center space-x-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHit}
                    onChange={(e) => setIsHit(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Xit mahsulot
                  </span>
                </label>

                <label className="flex items-center space-x-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Yangi kelgan
                  </span>
                </label>
              </div>

              {/* Image Upload */}
              <div className="p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-700">Mahsulot rasmi</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-16 h-16 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://... rasm havolasi"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs"
                    />
                    <label className="cursor-pointer inline-flex py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] items-center space-x-1.5 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{createUploading ? 'Yuklanmoqda...' : 'Fayldan rasm yuklash (WebP)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={createUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setCreateUploading(true);
                            const uploadedUrl = await uploadImageFile(file);
                            setImageUrl(uploadedUrl);
                          } catch (err: any) {
                            alert(err.message || 'Rasm yuklashda xatolik');
                          } finally {
                            setCreateUploading(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Tavsif (Oʻzbekcha)</label>
                <textarea
                  rows={2}
                  value={descriptionUz}
                  onChange={(e) => setDescriptionUz(e.target.value)}
                  placeholder="Mahsulot haqida qisqacha maʻlumot..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center space-x-2 shadow-md shadow-brand-500/25 transition active:scale-95 disabled:opacity-50"
                >
                  {createSubmitting ? 'Saqlanmoqda...' : 'Mahsulotni qoʻshish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
