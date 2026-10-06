'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  Edit,
  X,
  Phone,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { formatSom } from '../../../lib/currency';

const STATUSES = ['ALL', 'NEW', 'IN_REVIEW', 'APPROVED', 'DELIVERED', 'REJECTED', 'CANCELLED'];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('page', String(page));

      const res = await fetchApi(`/api/v1/admin/applications?${params.toString()}`);
      setApplications(res.items || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadApplications();
  };

  const handleOpenEdit = (app: any) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setInternalNotes(app.internalNotes || '');
    setComment('');
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setUpdating(true);
      await fetchApi(`/api/v1/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          internalNotes,
          comment,
        }),
      });

      setSelectedApp(null);
      loadApplications();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportExcel = () => {
    const token = localStorage.getItem('nasiyago_admin_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.open(`${apiUrl}/api/v1/admin/applications/export/excel?token=${token}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700">YANGI</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700">KOʻRIB CHIQILMOQDA</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700">TASDIQLANDI</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-700">YETKAZILDI</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700">BEKOR QILINDI</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Nasiya arizalari</h1>
          <p className="text-xs text-slate-500 mt-0.5">Jami: {total} ta ariza</p>
        </div>

        <button
          onClick={handleExportExcel}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excelga yuklab olish</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Barchasi' : st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ariza raqami, ism yoki telefon orqali qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          <button
            type="submit"
            className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl"
          >
            Qidirish
          </button>
        </form>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ariza №</th>
                <th className="py-3 px-4">Mijoz va Telefon</th>
                <th className="py-3 px-4">Tuman / Manzil</th>
                <th className="py-3 px-4">Mahsulot</th>
                <th className="py-3 px-4">Muddat / Toʻlov</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Arizalar mavjud emas
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      #{app.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.customerName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{app.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="font-semibold text-slate-800 truncate">{app.district}</div>
                      <div className="text-slate-400 text-[11px] truncate">{app.address}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[160px]">
                        {app.items?.[0]?.product?.nameUz || '—'}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {app.items?.[0]?.variant?.colorUz}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-brand-600">
                        {formatSom(app.monthlyPayment)}/oy
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {app.termMonths} oy • Jami: {formatSom(app.totalPrice)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(app)}
                        className="py-1.5 px-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50 text-slate-700 hover:text-brand-700 font-bold transition flex items-center space-x-1 ml-auto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Oʻzgartirish</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Application Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative space-y-5 animate-in fade-in duration-150">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase text-brand-600 tracking-wider">
                Ariza boshqaruvi
              </span>
              <h3 className="text-xl font-black text-slate-900">
                #{selectedApp.applicationNumber} — {selectedApp.customerName}
              </h3>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Arizaning yangi holati</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-white font-semibold outline-none"
                >
                  <option value="NEW">NEW (Yangi)</option>
                  <option value="IN_REVIEW">IN_REVIEW (Koʻrib chiqilmoqda)</option>
                  <option value="APPROVED">APPROVED (Tasdiqlandi)</option>
                  <option value="DELIVERED">DELIVERED (Yetkazildi)</option>
                  <option value="REJECTED">REJECTED (Rad etildi)</option>
                  <option value="CANCELLED">CANCELLED (Bekor qilindi)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status oʻzgarishi sababi / izoh</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Masalan: Mijoz bilan gaplashildi, pasport tasdiqlandi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ichki eslatmalar (Menejer uchun)</label>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Mijoz haqida ichki maʼlumotlar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  {updating ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
