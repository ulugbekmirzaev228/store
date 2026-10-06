'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ProductCard } from '../../../components/ProductCard';
import { ApplicationModal } from '../../../components/ApplicationModal';
import { fetchApi } from '../../../lib/api';
import { getDictionary, Locale } from '../../../lib/i18n';

export default function CatalogPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;
  const t = getDictionary(lang);
  const searchParams = useSearchParams();

  // Filters state
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [selectedRom, setSelectedRom] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data state
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1 });
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Application Modal state
  const [selectedProductForModal, setSelectedProductForModal] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Load brands and categories once
  useEffect(() => {
    Promise.all([
      fetchApi('/api/v1/brands').catch(() => []),
      fetchApi('/api/v1/categories').catch(() => []),
    ]).then(([b, c]) => {
      setBrands(b);
      setCategories(c);
    });
  }, []);

  // Sync with searchParams on url change
  useEffect(() => {
    const brandFromUrl = searchParams.get('brand');
    const catFromUrl = searchParams.get('category');
    if (brandFromUrl) setSelectedBrand(brandFromUrl);
    if (catFromUrl) setSelectedCategory(catFromUrl);
  }, [searchParams]);

  // Load products whenever filters change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedBrand) params.append('brand', selectedBrand);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedRam) params.append('ram', selectedRam);
        if (selectedRom) params.append('rom', selectedRom);
        if (selectedCondition) params.append('condition', selectedCondition);
        if (sortBy) params.append('sort', sortBy);
        params.append('page', String(currentPage));
        params.append('limit', '12');

        const res = await fetchApi(`/api/v1/products?${params.toString()}`);
        setProducts(res.items || []);
        setPagination(res.pagination || { total: 0, totalPages: 1 });
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedBrand, selectedCategory, selectedRam, selectedRom, selectedCondition, sortBy, currentPage]);

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedRam('');
    setSelectedRom('');
    setSelectedCondition('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleQuickApply = (product: any) => {
    setSelectedProductForModal(product);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Title & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.nav.catalog}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {pagination.total} {t.catalog.productsFound}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 py-2 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
          >
            <Filter className="w-4 h-4 text-brand-600" />
            <span>{t.catalog.filters}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="hidden sm:inline text-slate-400 font-medium">{t.catalog.sortBy}:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="newest">{t.catalog.sortNewest}</option>
              <option value="popular">{t.catalog.sortPopular}</option>
              <option value="price_asc">{t.catalog.sortPriceAsc}</option>
              <option value="price_desc">{t.catalog.sortPriceDesc}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR (DESKTOP) */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>{t.catalog.filters}</span>
            </span>
            <button
              onClick={clearFilters}
              className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.catalog.clearFilters}</span>
            </button>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.catalog.brand}
            </label>
            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => { setSelectedBrand(''); setCurrentPage(1); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                  selectedBrand === '' ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                Barchasi
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => { setSelectedBrand(b.slug); setCurrentPage(1); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex justify-between ${
                    selectedBrand === b.slug ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span>{b.name}</span>
                  {b._count?.products !== undefined && (
                    <span className="text-slate-400 text-[10px]">({b._count.products})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.catalog.category}
            </label>
            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                  selectedCategory === '' ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                Barchasi
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelectedCategory(c.slug); setCurrentPage(1); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex justify-between ${
                    selectedCategory === c.slug ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span>{lang === 'ru' ? c.nameRu : c.nameUz}</span>
                  {c._count?.products !== undefined && (
                    <span className="text-slate-400 text-[10px]">({c._count.products})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Memory ROM */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.catalog.rom}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['128 GB', '256 GB', '512 GB'].map((rom) => (
                <button
                  key={rom}
                  type="button"
                  onClick={() => {
                    setSelectedRom(selectedRom === rom ? '' : rom);
                    setCurrentPage(1);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                    selectedRom === rom
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {rom}
                </button>
              ))}
            </div>
          </div>

          {/* Memory RAM */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.catalog.ram}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['8 GB', '12 GB', '16 GB'].map((ram) => (
                <button
                  key={ram}
                  type="button"
                  onClick={() => {
                    setSelectedRam(selectedRam === ram ? '' : ram);
                    setCurrentPage(1);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                    selectedRam === ram
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {ram}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.catalog.condition}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCondition(selectedCondition === 'NEW' ? '' : 'NEW');
                  setCurrentPage(1);
                }}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                  selectedCondition === 'NEW'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t.catalog.conditionNew}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCondition(selectedCondition === 'USED' ? '' : 'USED');
                  setCurrentPage(1);
                }}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                  selectedCondition === 'USED'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t.catalog.conditionUsed}
              </button>
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 text-sm">
                Tanlangan filtrlar boʻyicha mahsulot topilmadi.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 py-2 px-4 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Filtrlarni tozalash
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    lang={lang}
                    onQuickApply={handleQuickApply}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(pagination.totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                        currentPage === idx + 1
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full flex flex-col justify-between p-5 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <span>{t.catalog.filters}</span>
                </span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t.catalog.brand}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { setSelectedBrand(''); setCurrentPage(1); }}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold transition ${
                      selectedBrand === '' ? 'bg-brand-50 border-brand-600 text-brand-700' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Barchasi
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => { setSelectedBrand(b.slug); setCurrentPage(1); }}
                      className={`py-2 px-2.5 rounded-xl border text-center font-bold transition ${
                        selectedBrand === b.slug ? 'bg-brand-50 border-brand-600 text-brand-700' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory ROM */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t.catalog.rom}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['128 GB', '256 GB', '512 GB'].map((rom) => (
                    <button
                      key={rom}
                      type="button"
                      onClick={() => {
                        setSelectedRom(selectedRom === rom ? '' : rom);
                        setCurrentPage(1);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        selectedRom === rom
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {rom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t.catalog.condition}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCondition(selectedCondition === 'NEW' ? '' : 'NEW');
                      setCurrentPage(1);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      selectedCondition === 'NEW'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {t.catalog.conditionNew}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCondition(selectedCondition === 'USED' ? '' : 'USED');
                      setCurrentPage(1);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      selectedCondition === 'USED'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {t.catalog.conditionUsed}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Tozalash
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-500/25"
              >
                Natijalarni koʻrish ({pagination.total})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Application Modal */}
      {selectedProductForModal && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProductForModal(null);
          }}
          product={selectedProductForModal}
          selectedVariant={selectedProductForModal.variants?.[0] || { id: selectedProductForModal.id, colorUz: 'Standart', memoryRom: '256 GB', price: selectedProductForModal.basePrice }}
          initialTermMonths={12}
          initialMonthlyPayment={selectedProductForModal.minMonthlyPayment || Math.round((selectedProductForModal.basePrice * 1.28) / 12)}
          initialTotalPrice={Math.round(selectedProductForModal.basePrice * 1.28)}
          lang={lang}
        />
      )}
    </div>
  );
}
