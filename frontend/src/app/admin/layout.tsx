'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import '../globals.css';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  FolderTree,
  Calculator,
  ImageIcon,
  MapPin,
  Users,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { fetchApi } from '../../lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('nasiyago_admin_user');
        return cached ? JSON.parse(cached) : null;
      } catch (_) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // If on login page, don't guard
    if (pathname.includes('/admin/login')) {
      setLoading(false);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('nasiyago_admin_token') : null;
    if (!token) {
      setLoading(false);
      router.push('/admin/login');
      return;
    }

    fetchApi('/api/v1/auth/me')
      .then((data) => {
        setUser(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nasiyago_admin_user', JSON.stringify(data));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Admin auth check failed:', err);
        localStorage.removeItem('nasiyago_admin_token');
        localStorage.removeItem('nasiyago_admin_user');
        setLoading(false);
        router.push('/admin/login');
      });
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('nasiyago_admin_token');
    localStorage.removeItem('nasiyago_admin_user');
    router.push('/admin/login');
  };

  if (pathname.includes('/admin/login')) {
    return <>{children}</>;
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-400 text-xs font-semibold">Admin panel yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Boshqaruv paneli', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Arizalar roʻyxati', href: '/admin/applications', icon: ClipboardList },
    { label: 'Mahsulotlar katalogi', href: '/admin/products', icon: Package },
    { label: 'Kategoriyalar', href: '/admin/categories', icon: FolderTree },
    { label: 'Foydalanuvchilar', href: '/admin/users', icon: Users },
    { label: 'Nasiya shartlari', href: '/admin/installments', icon: Calculator },
    { label: 'Promo bannerlar', href: '/admin/banners', icon: ImageIcon },
    { label: 'Doʻkon filiallari', href: '/admin/branches', icon: MapPin },
    { label: 'Tizim sozlamalari', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between p-5 border-r border-slate-800">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-lg tracking-tight">NasiyaGo</div>
              <div className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                Admin boshqaruvi
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          {user && (
            <div className="px-2">
              <div className="font-bold text-white text-xs truncate">{user.name}</div>
              <div className="text-[10px] font-semibold text-emerald-400 uppercase mt-0.5">
                {user.role}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Tizimdan chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-bold text-slate-400 uppercase">
              Toshkent, NasiyaGo Electronics Admin Panel
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/uz"
              target="_blank"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              <span>Saytni ochish</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Sidebar Slide-over Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="relative w-72 max-w-xs bg-slate-900 text-slate-300 flex-1 flex flex-col justify-between p-5 z-50 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/admin/dashboard" onClick={() => setMobileSidebarOpen(false)} className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-white text-base tracking-tight">NasiyaGo</div>
                    <div className="text-[9px] text-brand-400 font-bold uppercase tracking-wider">
                      Admin
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 text-xs font-semibold">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition ${
                        isActive
                          ? 'bg-brand-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              {user && (
                <div className="px-2">
                  <div className="font-bold text-white text-xs truncate">{user.name}</div>
                  <div className="text-[10px] font-semibold text-emerald-400 uppercase mt-0.5">
                    {user.role}
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Tizimdan chiqish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
