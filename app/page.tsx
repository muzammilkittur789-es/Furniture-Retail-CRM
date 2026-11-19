import Link from 'next/link';
import { Tablet, LayoutDashboard, ArrowRight, Sparkles, PhoneCall, ShieldCheck } from 'lucide-react';

export default function RootHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 text-slate-900 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Background Soft Blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-display text-xl font-bold shadow-brand">
            AF
          </div>
          <div>
            <span className="font-display text-2xl tracking-tight font-bold text-slate-900 block leading-tight">
              Alishan Furnitures
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 font-semibold">
              Showroom Management System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Showroom Floor Ready</span>
        </div>
      </header>

      {/* Central Selection Section */}
      <main className="relative z-10 max-w-4xl w-full mx-auto my-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-200 text-xs font-semibold text-indigo-700 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Welcome to Alishan Furnitures</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
          Select Your Workspace <span className="inline-block animate-bounce">✨</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-12 font-normal">
          A high-velocity mobile app for showroom salesmen and an executive CRM for business owners.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
          {/* Card 1: Sales Tablet */}
          <Link
            href="/sales"
            className="group relative bg-white hover:bg-white border-2 border-slate-200/80 hover:border-indigo-500 rounded-3xl p-8 sm:p-10 transition-all duration-300 shadow-card hover:shadow-card-hover flex flex-col justify-between hover:-translate-y-1"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                <Tablet className="w-7 h-7 stroke-[2]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                Module 01 • Floor Tablet
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                Sales Floor
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Browse showroom furniture, generate fast WhatsApp quotes with custom discounts, and manage morning customer follow-ups.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Open Sales Floor</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Admin Dashboard */}
          <Link
            href="/admin"
            className="group relative bg-white hover:bg-white border-2 border-slate-200/80 hover:border-indigo-500 rounded-3xl p-8 sm:p-10 transition-all duration-300 shadow-card hover:shadow-card-hover flex flex-col justify-between hover:-translate-y-1"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                <LayoutDashboard className="w-7 h-7 stroke-[2]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                Module 02 • Owner Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                Admin Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Track revenue, view customer quotes, assign follow-up salespeople, manage stock, and control staff PINs.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 Alishan Furnitures. All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs font-medium">
          <Link href="/sales" className="hover:text-indigo-600 transition">Sales Floor</Link>
          <span>•</span>
          <Link href="/admin" className="hover:text-indigo-600 transition">Admin Dashboard</Link>
          <span>•</span>
          <Link href="/admin/products" className="hover:text-indigo-600 transition">Stock Inventory</Link>
          <span>•</span>
          <Link href="/admin/staff" className="hover:text-indigo-600 transition">Staff PINs</Link>
        </div>
      </footer>
    </div>
  );
}
