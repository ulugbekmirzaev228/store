'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Scale, Plus, X, ArrowRight } from 'lucide-react';
import { formatSom } from '../../../lib/currency';
import { fetchApi } from '../../../lib/api';
import { Locale, getDictionary } from '../../../lib/i18n';

export default function ComparePage({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ru' ? 'ru' : 'uz') as Locale;
  const t = getDictionary(lang);

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparedProducts, setComparedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchApi('/api/v1/products?limit=20').then((res) => {
      const items = res.items || [];
      setAvailableProducts(items);
      if (items.length >= 2) {
        setSelectedIds([items[0].id, items[1].id]);
      }
    });
  }, []);

  useEffect(() => {
    async function loadCompared() {
      const prods = await Promise.all(
        selectedIds.map(async (id) => {
          const found = availableProducts.find((p) => p.id === id);
          if (!found) return null;
          return fetchApi(`/api/v1/products/${found.slug}`).catch(() => null);
        })
      );
      setComparedProducts(prods.filter(Boolean));
    }

    if (selectedIds.length > 0) {
      loadCompared();
    } else {
      setComparedProducts([]);
    }
  }, [selectedIds]);

  const removeProduct = (id: string) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  const addProduct = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Scale className="w-7 h-7 text-brand-600" />
            <span>Gadjetlarni taqqoslash</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bir vaqtning oʻzida 3 tagacha mahsulotning narxi va xususiyatlarini taqqoslang
          </p>
        </div>

        {selectedIds.length < 3 && (
          <div className="flex items-center space-x-2">
            <select
              onChange={(e) => {
                if (e.target.value) addProduct(e.target.value);
                e.target.value = '';
              }}
              className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="">+ Taqqoslashga gadjet qoʻshish</option>
              {availableProducts
                .filter((p) => !selectedIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameUz}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {comparedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-500">Taqqoslash uchun gadjet tanlanmagan</p>
          <Link
            href={`/${lang}/catalog`}
            className="mt-4 inline-block py-2.5 px-5 rounded-xl bg-brand-600 text-white font-bold text-xs"
          >
            Katalogga oʻtish
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="min-w-[650px] divide-y divide-slate-100">
            {/* Headers with Photos */}
            <div className="grid grid-cols-4 p-6 bg-slate-50">
              <div className="font-bold text-xs text-slate-400 uppercase self-end pb-2">
                Mahsulot
              </div>
              {comparedProducts.map(({ product }: any) => (
                <div key={product.id} className="relative px-3 text-center">
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-0 right-2 p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <img
                    src={product.images?.[0]?.imageUrl}
                    alt={product.nameUz}
                    className="w-24 h-24 object-contain mx-auto mb-2"
                  />
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {product.nameUz}
                  </div>
                  <div className="text-xs font-extrabold text-brand-600 mt-1">
                    {formatSom(product.basePrice)}
                  </div>
                  <Link
                    href={`/${lang}/product/${product.slug}`}
                    className="mt-2 inline-flex items-center text-[11px] font-bold text-brand-600 hover:underline"
                  >
                    <span>Koʻrish</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Monthly Installment Row */}
            <div className="grid grid-cols-4 p-4 text-xs font-semibold">
              <div className="text-slate-500">12 oyga nasiya toʻlovi:</div>
              {comparedProducts.map(({ product }: any) => (
                <div key={product.id} className="px-3 text-center font-black text-brand-600 text-sm">
                  {formatSom(Math.round((product.basePrice * 1.28) / 12))}/oy
                </div>
              ))}
            </div>

            {/* Brand Row */}
            <div className="grid grid-cols-4 p-4 text-xs">
              <div className="text-slate-500 font-medium">Brend:</div>
              {comparedProducts.map(({ product }: any) => (
                <div key={product.id} className="px-3 text-center font-bold text-slate-800">
                  {product.brand.name}
                </div>
              ))}
            </div>

            {/* Category Row */}
            <div className="grid grid-cols-4 p-4 text-xs">
              <div className="text-slate-500 font-medium">Kategoriya:</div>
              {comparedProducts.map(({ product }: any) => (
                <div key={product.id} className="px-3 text-center text-slate-700">
                  {product.category.nameUz}
                </div>
              ))}
            </div>

            {/* Specs rows */}
            {['Ekran', 'Protsessor', 'Kamera', 'Batareya'].map((group) => (
              <div key={group} className="grid grid-cols-4 p-4 text-xs">
                <div className="text-slate-500 font-medium">{group}:</div>
                {comparedProducts.map(({ product }: any) => {
                  const spec = product.specs?.find((s: any) => s.groupUz === group);
                  return (
                    <div key={product.id} className="px-3 text-center text-slate-800">
                      {spec?.valueUz || '—'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
