'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StaffSession } from '@/lib/types/database';
import { AdminPinModal } from './admin-pin-modal';
import { LiveClock } from '@/components/common/live-clock';
import {
  LayoutDashboard,
  BarChart3,
  Armchair,
  Tablet,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Furniture Stock',
    href: '/admin/products',
    icon: Armchair,
  },
  {
    name: 'Sales Staff & PINs',
    href: '/admin/staff',
    icon: KeyRound,
  },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [adminSession, setAdminSession] = useState<StaffSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('atelier_admin_session');
      if (stored) {
        setAdminSession(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse admin session:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const handleAdminSuccess = (admin: StaffSession) => {
    setAdminSession(admin);
    try {
      sessionStorage.setItem('atelier_admin_session', JSON.stringify(admin));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleLogout = () => {
    setAdminSession(null);
    try {
      sessionStorage.removeItem('atelier_admin_session');
    } catch (e) {
      console.warn(e);
    }
  };

  const isLocked = isInitialized && !adminSession;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* 1. Admin PIN Gate */}
      <AdminPinModal isOpen={isLocked} onSuccess={handleAdminSuccess} />

      {/* 2. Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-display text-xs font-bold shadow-xs">
            AF
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm block leading-none">
              Alishan Furnitures
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold block">
              Owner Dashboard
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition active:scale-95"
          title="Open Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        />
      )}

      {/* 3. Modern Slate-900 Sidebar (Desktop Sticky Left, Mobile Slide from Right) */}
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-72 bg-slate-900 text-slate-200 border-l md:border-l-0 md:border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 shadow-2xl md:shadow-none md:static md:sticky md:top-0 md:left-0 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          {/* Logo & Mobile Close Button */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-display text-base font-bold shadow-md shadow-indigo-600/30">
                AF
              </div>
              <div>
                <h1 className="font-display text-lg font-bold tracking-wide text-white leading-none">
                  ALISHAN
                </h1>
                <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold block mt-1">
                  Furnitures • Owner
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Date & Time Clock in Sidebar */}
          <div className="mt-4">
            <LiveClock variant="dark" showSeconds={true} className="w-full justify-center text-[11px]" />
          </div>

          {/* Navigation */}
          <nav className="mt-7 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[2]" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Floor Tablet Link & Admin Profile */}
        <div className="p-6 border-t border-slate-800 space-y-4">
          <Link
            href="/sales?from=admin"
            className="flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
          >
            <div className="flex items-center gap-2.5">
              <Tablet className="w-4 h-4 text-indigo-400" />
              <span>Open Sales Screen</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </Link>

          {adminSession && (
            <div className="pt-2 flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{adminSession.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 capitalize block tracking-wider mt-0.5">
                  Showroom Owner
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Lock Dashboard"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 4. Main Executive View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
        <main className="flex-1 p-3.5 sm:p-8 lg:p-12 max-w-7xl w-full mx-auto">
          {adminSession ? children : null}
        </main>
      </div>
    </div>
  );
}
