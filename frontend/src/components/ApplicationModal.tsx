'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, Truck, Store, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatSom } from '../lib/currency';
import { fetchApi } from '../lib/api';
import { Locale, getDictionary } from '../lib/i18n';

const TASHKENT_DISTRICTS = [
  'Chilonzor tumani',
  'Yunusobod tumani',
  'Mirzo Ulugʻbek tumani',
  'Mirobod tumani',
  'Yakkasaroy tumani',
  'Shayxontohur tumani',
  'Olmazor tumani',
  'Uchtepa tumani',
  'Yashnobod tumani',
  'Sergeli tumani',
  'Yangihayot tumani',
  'Bektemir tumani',
];

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedVariant: any;
  initialTermMonths?: number;
  initialDownPayment?: number;
  initialMonthlyPayment?: number;
  initialTotalPrice?: number;
  lang: Locale;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant,
  initialTermMonths = 12,
  initialDownPayment = 0,
  initialMonthlyPayment = 0,
  initialTotalPrice = 0,
  lang,
}) => {
  const t = getDictionary(lang);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [district, setDistrict] = useState(TASHKENT_DISTRICTS[0]);
  const [address, setAddress] = useState('');
  const [passportSeries, setPassportSeries] = useState('');
  const [preferredContactTime, setPreferredContactTime] = useState('10:00 - 13:00');
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [branchId, setBranchId] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  if (!isOpen) return null;

  // Phone input formatting with +998 mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage(t.checkout.fullName);
      return;
    }

    if (phone.replace(/[^0-9]/g, '').length < 12) {
      setErrorMessage('Telefon raqamini toʻliq kiriting: +998 (90) 123-45-67');
      return;
    }

    if (deliveryMethod === 'DELIVERY' && !address.trim()) {
      setErrorMessage(t.checkout.address);
      return;
    }

    if (!consentAgreed) {
      setErrorMessage('Shartlarga rozilik bildirishingiz kerak');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetchApi('/api/v1/applications', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          phone,
          district,
          address: deliveryMethod === 'DELIVERY' ? address : 'Doʻkondan olib ketish',
          passportSeries: passportSeries || undefined,
          preferredContactTime,
          deliveryMethod,
          branchId: branchId || undefined,
          consentAgreed,
          productId: product.id,
          variantId: selectedVariant.id,
          termMonths: initialTermMonths,
          downPaymentAmount: initialDownPayment,
        }),
      });

      setSuccessData(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Xatolik yuz berdi. Qayta urinib koʻring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] sm:max-h-[92vh] overflow-y-auto p-5 sm:p-8 animate-in fade-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 border-t sm:border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success View */}
        {successData ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {t.checkout.successTitle}
            </h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              {lang === 'ru' ? successData.messageRu : successData.messageUz}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  {t.checkout.appNumberLabel}
                </span>
                <span className="text-lg font-black text-brand-600 tracking-wider">
                  #{successData.applicationNumber}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Mahsulot:</span>
                <span className="font-semibold text-slate-900">{product.nameUz}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Nasiya muddati:</span>
                <span className="font-semibold text-slate-900">{initialTermMonths} oy</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Oylik toʻlov:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {formatSom(initialMonthlyPayment)} / oy
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              {t.checkout.saveNotice}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/${lang}/status?phone=${encodeURIComponent(phone)}&applicationNumber=${successData.applicationNumber}`}
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm text-center transition"
              >
                Ariza holatini kuzatish
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
              >
                Yopish
              </button>
            </div>
          </div>
        ) : (
          /* Application Form View */
          <div>
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.checkout.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t.checkout.subtitle}
              </p>
            </div>

            {/* Selected Gadget Summary Pill */}
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mb-6">
              {product.images?.[0] && (
                <img
                  src={product.images[0].imageUrl}
                  alt={product.nameUz}
                  className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-200"
                />
              )}
              <div className="flex-1 min-w-0 text-xs">
                <div className="font-bold text-slate-900 truncate">{product.nameUz}</div>
                <div className="text-slate-500">
                  {selectedVariant?.colorUz} • {selectedVariant?.memoryRom}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-black text-brand-600">
                  {formatSom(initialMonthlyPayment)}/oy
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">{initialTermMonths} oyga</div>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {t.checkout.fullName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masalan: Sardor Rahimov"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 outline-none transition"
                />
              </div>

              {/* Phone with +998 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {t.checkout.phone} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+998 (90) 123-45-67"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium outline-none transition"
                />
              </div>

              {/* Delivery Method Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {t.checkout.deliveryMethod}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('DELIVERY')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                      deliveryMethod === 'DELIVERY'
                        ? 'bg-brand-50 border-brand-600 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Toshkentda yetkazish</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('PICKUP')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                      deliveryMethod === 'PICKUP'
                        ? 'bg-brand-50 border-brand-600 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Doʻkondan olib ketish</span>
                  </button>
                </div>
              </div>

              {/* District & Address */}
              {deliveryMethod === 'DELIVERY' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        {t.checkout.district}
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 bg-white outline-none"
                      >
                        {TASHKENT_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        {t.checkout.preferredTime}
                      </label>
                      <select
                        value={preferredContactTime}
                        onChange={(e) => setPreferredContactTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 bg-white outline-none"
                      >
                        <option value="10:00 - 13:00">10:00 - 13:00</option>
                        <option value="13:00 - 17:00">13:00 - 17:00</option>
                        <option value="17:00 - 20:00">17:00 - 20:00</option>
                        <option value="Istalgan vaqtda">Istalgan vaqtda</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      {t.checkout.address} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Masalan: Bunyodkor shoh koʻchasi, 14-uy, 25-xonadon"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 outline-none transition"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {t.checkout.pickupBranch}
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-slate-800 bg-white outline-none"
                  >
                    <option value="">Chilonzor filiali (Bunyodkor 42)</option>
                    <option value="">Yunusobod filiali (Amir Temur 107B)</option>
                    <option value="">Malika savdo majmuasi (B-blok 24)</option>
                  </select>
                </div>
              )}

              {/* Optional Passport series */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  {t.checkout.passport}
                </label>
                <input
                  type="text"
                  value={passportSeries}
                  onChange={(e) => setPassportSeries(e.target.value.toUpperCase())}
                  placeholder="AA 1234567"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-brand-500 text-slate-800 outline-none transition font-mono"
                />
              </div>

              {/* Consent checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer text-slate-600 text-xs">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span>{t.checkout.consent}</span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-lg shadow-brand-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Yuborilmoqda...' : t.checkout.submit}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
