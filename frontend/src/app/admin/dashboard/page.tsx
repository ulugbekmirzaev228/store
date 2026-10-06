'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ClipboardList,
  CheckCircle2,
  Clock,
  Package,
  ArrowUpRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { formatSom } from '../../../lib/currency';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/v1/admin/dashboard/stats')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Boshqaruv paneli</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Bugungi arizalar, konversiya va oylik koʻrsatkichlar tahlili
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Bugungi arizalar</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics.todayApplications || 0} ta
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              Haftada: {metrics.weekApplications || 0} ta
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Jami arizalar</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics.totalApplications || 0} ta
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">
              Tasdiqlangan: {metrics.approvedApplications || 0}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Konversiya koʻrsatkichi</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics.conversionRate || 0}%
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              Tasdiqlash / yetkazish ulushi
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Faol mahsulotlar</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics.totalProducts || 0} ta
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">
              Doʻkonda sotuvda
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Soʻnggi arizalar</h2>
            <p className="text-xs text-slate-400">Yangi kelib tushgan buyurtmalar</p>
          </div>
          <Link
            href="/admin/applications"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            <span>Barcha arizalar</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Ariza №</th>
                <th className="py-3 px-4">Mijoz</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Mahsulot</th>
                <th className="py-3 px-4">Oylik toʻlov</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4 rounded-r-xl">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data?.recentApplications?.map((app: any) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <Link href={`/admin/applications`} className="hover:text-brand-600">
                      #{app.applicationNumber}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{app.customerName}</td>
                  <td className="py-3.5 px-4 font-mono">{app.phone}</td>
                  <td className="py-3.5 px-4">
                    {app.items?.[0]?.product?.nameUz || '—'}
                  </td>
                  <td className="py-3.5 px-4 font-black text-brand-600">
                    {formatSom(app.monthlyPayment)}/oy
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
