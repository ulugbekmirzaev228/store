'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Edit,
  Trash2,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Phone,
  Mail,
  UserCheck,
  UserX,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';

const ROLES = [
  { value: 'ADMIN', label: 'Bosh admin (ADMIN)', desc: 'Barcha modullarga toʻliq kirish' },
  { value: 'MANAGER', label: 'Katta menejer (MANAGER)', desc: 'Arizalar va mijozlar bilan ishlash' },
  { value: 'OPERATOR', label: 'Operator (OPERATOR)', desc: 'Dastlabki arizalarni qabul qilish' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [role, setRole] = useState('OPERATOR');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersData, meData] = await Promise.all([
        fetchApi('/api/v1/admin/users'),
        fetchApi('/api/v1/auth/me').catch(() => null),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      if (meData) setCurrentUser(meData);
    } catch (err: any) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('+998 ');
    setRole('OPERATOR');
    setPassword('');
    setIsActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '+998 ');
    setRole(u.role);
    setPassword(''); // leave blank if not changing
    setIsActive(u.isActive);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (u: any) => {
    if (currentUser?.id === u.id) {
      alert('Oʻzingizning hisobingiz holatini nofaol qila olmaysiz.');
      return;
    }

    try {
      await fetchApi(`/api/v1/admin/users/${u.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleDelete = async (u: any) => {
    if (currentUser?.id === u.id) {
      alert('Oʻzingizning hisobingizni oʻchira olmaysiz.');
      return;
    }

    if (!confirm(`Haqiqatan ham "${u.name}" (${u.email}) foydalanuvchisini oʻchirmoqchimisiz?`)) {
      return;
    }

    try {
      await fetchApi(`/api/v1/admin/users/${u.id}`, { method: 'DELETE' });
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('F.I.Sh. va email kiritilishi shart');
      return;
    }

    if (!editingUser && !password.trim()) {
      setErrorMsg('Yangi foydalanuvchi uchun parol kiritilishi shart');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        role,
        isActive,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      if (editingUser) {
        await fetchApi(`/api/v1/admin/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/api/v1/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setIsModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Bosh admin
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            Katta menejer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Shield className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Operator
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Users className="w-7 h-7 text-brand-600" />
            <span>Foydalanuvchilar boshqaruvi</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Admin va operatorlar hisoblarini boshqarish, rollar biriktirish va parollarni yangilash
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Yangi foydalanuvchi</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ism, email yoki telefon boʻyicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold hidden sm:block">
          Jami: <span className="text-slate-900 font-bold">{users.length}</span> nafar xodim
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">Yuklanmoqda...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">
            Foydalanuvchilar topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] sm:text-xs">
                <tr>
                  <th className="py-3 px-4">Foydalanuvchi</th>
                  <th className="py-3 px-4">Aloqa</th>
                  <th className="py-3 px-4">Roli</th>
                  <th className="py-3 px-4 text-center">Holati</th>
                  <th className="py-3 px-4 text-center">Arizalari</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.2 rounded font-black">
                              (Siz)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold transition ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                          }`}
                          title="Holatni oʻzgartirish"
                        >
                          {u.isActive ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1 text-emerald-600" />
                              Faol
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1 text-slate-500" />
                              Nofaol
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {u._count?.assignedApps || 0} ta
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                            title="Tahrirlash / Parol yangilash"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Oʻchirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                {editingUser ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi qoʻshish'}
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
                  Toʻliq ism (F.I.Sh.) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Azizbek Qodirov"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email (Login) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@nasiyago.uz"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Telefon raqami
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123-45-67"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Roli va ruxsati <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none bg-white font-medium"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {editingUser ? 'Yangi parol (oʻzgartirish ixtiyoriy)' : 'Parol'} {!editingUser && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? 'Eski parolni qoldirish uchun boʻsh qoldiring' : 'Kamida 6 ta belgi'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span className="font-bold text-slate-700 text-xs">Foydalanuvchi hisobi faol (tizimga kira oladi)</span>
                </label>
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
                  {submitting ? 'Saqlanmoqda...' : editingUser ? 'Oʻzgarishlarni saqlash' : 'Foydalanuvchi yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
