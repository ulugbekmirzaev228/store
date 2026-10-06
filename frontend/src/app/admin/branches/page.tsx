'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  X,
  Clock,
  Phone,
  Navigation,
  Edit,
  ExternalLink,
  Crosshair,
  CheckCircle2,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';

const TASHKENT_PRESETS = [
  { name: "Chilonzor (Bunyodkor shoh ko'chasi 42)", lat: 41.2825, lng: 69.2135 },
  { name: "Yunusobod (Amir Temur shoh ko'chasi 107B)", lat: 41.3532, lng: 69.2882 },
  { name: "Malika bozori (Kichik halqa yo'li 14)", lat: 41.3412, lng: 69.2678 },
  { name: "Mirobod (Oybek metrosi yaqinida)", lat: 41.2995, lng: 69.2730 },
  { name: "Sergeli (Yangi Sergeli ko'chasi)", lat: 41.2215, lng: 69.2224 },
  { name: "Shahar markazi (Amir Temur xiyoboni)", lat: 41.3111, lng: 69.2797 },
];

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);

  // Form fields
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [addressUz, setAddressUz] = useState('');
  const [addressRu, setAddressRu] = useState('');
  const [workingHours, setWorkingHours] = useState('09:00 - 21:00 (Har kuni)');
  const [phone, setPhone] = useState('+998 71 200 44 00');
  const [latitude, setLatitude] = useState('41.2825');
  const [longitude, setLongitude] = useState('69.2135');
  const [loading, setLoading] = useState(false);

  const loadBranches = () => {
    fetchApi('/api/v1/branches').then(setBranches).catch(console.error);
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setNameUz('');
    setNameRu('');
    setAddressUz('');
    setAddressRu('');
    setWorkingHours('09:00 - 21:00 (Har kuni)');
    setPhone('+998 71 200 44 00');
    setLatitude('41.2825');
    setLongitude('69.2135');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditingBranch(b);
    setNameUz(b.nameUz);
    setNameRu(b.nameRu);
    setAddressUz(b.addressUz);
    setAddressRu(b.addressRu);
    setWorkingHours(b.workingHours);
    setPhone(b.phone);
    setLatitude(String(b.latitude));
    setLongitude(String(b.longitude));
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof TASHKENT_PRESETS[0]) => {
    setLatitude(String(preset.lat));
    setLongitude(String(preset.lng));
    if (!addressUz) setAddressUz(preset.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUz || !addressUz) return;

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Koordinatalar toʻgʻri son formatida kiritilishi kerak (masalan: 41.2825 va 69.2135)');
      return;
    }

    try {
      setLoading(true);
      if (editingBranch) {
        await fetchApi(`/api/v1/admin/branches/${editingBranch.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nameUz,
            nameRu: nameRu || nameUz,
            addressUz,
            addressRu: addressRu || addressUz,
            workingHours,
            phone,
            latitude: latNum,
            longitude: lngNum,
          }),
        });
      } else {
        await fetchApi('/api/v1/admin/branches', {
          method: 'POST',
          body: JSON.stringify({
            nameUz,
            nameRu: nameRu || nameUz,
            addressUz,
            addressRu: addressRu || addressUz,
            workingHours,
            phone,
            latitude: latNum,
            longitude: lngNum,
          }),
        });
      }

      setIsModalOpen(false);
      loadBranches();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ushbu filialni oʻchirmoqchimisiz?')) return;
    try {
      await fetchApi(`/api/v1/admin/branches/${id}`, { method: 'DELETE' });
      loadBranches();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-brand-600" />
            <span>Toshkent filiallari va xarita koordinatalari</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Doʻkon manzillari, ish vaqti va xaritadagi aniq GPS koordinatalari (Latitude / Longitude)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-brand-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi filial qoʻshish</span>
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">{b.nameUz}</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Faol
                </span>
              </div>

              <p className="text-xs text-slate-600">{b.addressUz}</p>

              <div className="text-[11px] text-slate-500 space-y-1.5 pt-1">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{b.workingHours}</span>
                </div>
                <div className="flex items-center space-x-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{b.phone}</span>
                </div>
                <div className="flex items-center space-x-1.5 font-mono text-brand-600 font-bold">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>GPS: {b.latitude}, {b.longitude}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={`https://yandex.uz/maps/?pt=${b.longitude},${b.latitude}&z=16&l=map`}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition"
              >
                <Navigation className="w-3.5 h-3.5 text-brand-600" />
                <span>Xaritada</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition"
                  title="Tahrirlash"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  title="Oʻchirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase text-brand-600 tracking-wider">
                {editingBranch ? 'Filialni tahrirlash' : 'Yangi filial'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {editingBranch ? editingBranch.nameUz : 'Filial va GPS koordinatalarini kiritish'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Filial nomi (Oʻzbekcha) *</label>
                  <input
                    type="text"
                    required
                    value={nameUz}
                    onChange={(e) => setNameUz(e.target.value)}
                    placeholder="Chilonzor filiali"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Filial nomi (Ruscha)</label>
                  <input
                    type="text"
                    value={nameRu}
                    onChange={(e) => setNameRu(e.target.value)}
                    placeholder="Филиал Чиланзар"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manzil (Oʻzbekcha) *</label>
                <input
                  type="text"
                  required
                  value={addressUz}
                  onChange={(e) => setAddressUz(e.target.value)}
                  placeholder="Bunyodkor shoh koʻchasi 42 (Metro Mirzo Ulugʻbek)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ish vaqti</label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon raqam</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* GPS Coordinates Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-brand-600" />
                    <span>Xarita GPS Koordinatalari</span>
                  </label>
                  <a
                    href={`https://yandex.uz/maps/?pt=${longitude},${latitude}&z=16&l=map`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <span>Yandex xaritada tekshirish</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Kenglik (Latitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="41.2825"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Uzunlik (Longitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="69.2135"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Quick Tashkent Presets */}
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                    Tayyor Toshkent nuqtalari (bir klikda toʻldirish):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TASHKENT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="py-1 px-2.5 rounded-lg bg-white hover:bg-brand-50 hover:text-brand-700 border border-slate-200 text-[10px] font-bold text-slate-700 transition"
                      >
                        {preset.name.split(' ')[0]} ({preset.lat}, {preset.lng})
                      </button>
                    ))}
                  </div>
                </div>
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
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
                >
                  {loading ? 'Saqlanmoqda...' : (editingBranch ? 'Yangilash' : 'Filialni qoʻshish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
