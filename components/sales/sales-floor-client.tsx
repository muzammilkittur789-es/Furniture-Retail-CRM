'use client';

import React, { useState, useMemo } from 'react';
import { Product, StaffSession, FollowUpLead } from '@/lib/types/database';
import { PinPadModal } from '@/components/sales/pin-pad-modal';
import { ProductGrid } from '@/components/sales/product-grid';
import { QuoteCart } from '@/components/sales/quote-cart';
import { SalesmanFollowupsView } from '@/components/sales/salesman-followups-view';
import { formatINR } from '@/lib/utils';
import { Lock, ShoppingBag, ChevronUp, Armchair, PhoneCall } from 'lucide-react';

interface SalesFloorClientProps {
  initialProducts: Product[];
  initialFollowUps?: FollowUpLead[];
}

export function SalesFloorClient({
  initialProducts,
  initialFollowUps = [],
}: SalesFloorClientProps) {
  const [activeStaff, setActiveStaff] = useState<StaffSession | null>(null);
  const isLocked = activeStaff === null;

  const [activeTab, setActiveTab] = useState<'catalog' | 'followups'>('catalog');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const staffFollowUps = useMemo(() => {
    if (!activeStaff) return initialFollowUps;
    const isOwner = activeStaff.role === 'admin';
    return isOwner
      ? initialFollowUps
      : initialFollowUps.filter((l) => l.assignedStaffId === activeStaff.id);
  }, [activeStaff, initialFollowUps]);

  const pendingCallsCount = staffFollowUps.filter(
    (l) => l.status === 'pending' || l.status === 'called_no_answer'
  ).length;

  const handleToggleProduct = (product: Product) => {
    setSelectedProductIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleClearCart = () => {
    setSelectedProductIds([]);
    setIsMobileCartOpen(false);
  };

  const selectedProducts = initialProducts.filter((p) =>
    selectedProductIds.includes(p.id)
  );

  const subtotal = selectedProducts.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24 lg:pb-12 text-slate-900">
      {/* 1. Terminal PIN Pad Modal */}
      <PinPadModal
        isOpen={isLocked}
        onSuccess={(staff) => {
          setActiveStaff(staff);
        }}
      />

      {/* 2. Showroom Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-3.5 sm:px-6 py-2.5 sm:py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-display font-bold text-sm sm:text-base shadow-md shadow-indigo-600/20 border border-indigo-400/30 shrink-0">
              AF
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-lg font-bold tracking-tight text-slate-900 leading-tight truncate">
                ALISHAN FURNITURES
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-indigo-600 font-bold block">
                Sales Floor
              </span>
            </div>
          </div>

          {/* Active Sales Staff Session & Lock Action */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {activeStaff ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="truncate max-w-[75px] sm:max-w-[120px] md:max-w-none">
                    {activeStaff.name.split(' ')[0]}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStaff(null)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 shadow-2xs active:scale-95 shrink-0"
                  title="Lock Tablet"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Secured</span>
            )}
          </div>
        </div>
      </header>

      {/* 3. Main Floor Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7">
        {/* Module Switcher: Catalog vs Morning Follow-Ups */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-6 p-1.5 rounded-2xl bg-slate-200/80 w-full sm:w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap min-w-fit transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Armchair className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
            <span className="whitespace-nowrap">Showroom Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('followups')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap min-w-fit transition-all ${
              activeTab === 'followups'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            <span className="whitespace-nowrap">Morning Follow-Ups</span>
            {pendingCallsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none shrink-0">
                {pendingCallsCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'followups' && activeStaff ? (
          /* Salesman Pending Follow-Ups View */
          <SalesmanFollowupsView
            staff={activeStaff}
            initialLeads={staffFollowUps}
          />
        ) : (
          /* Showroom Floor Product Catalog Grid & Sticky Cart */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Product Catalog Grid */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="mb-5 sm:mb-6">
                <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-bold block mb-1">
                  Showroom Floor
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                  Furniture Items
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                  Select items to create a quick customer quote.
                </p>
              </div>

              <ProductGrid
                products={initialProducts}
                selectedProductIds={selectedProductIds}
                onToggleProduct={handleToggleProduct}
              />
            </div>

            {/* Right Column: Sticky Quote Cart on Desktop */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-24">
              {activeStaff && (
                <QuoteCart
                  selectedProducts={selectedProducts}
                  staff={activeStaff}
                  onRemoveProduct={handleRemoveProduct}
                  onClearCart={handleClearCart}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. Mobile & Tablet Floating Bottom Bar */}
      {selectedProducts.length > 0 && activeStaff && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                <ShoppingBag className="w-5 h-5 stroke-[2]" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                  {selectedProducts.length}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold block">
                  Current Quote ({selectedProducts.length} {selectedProducts.length === 1 ? 'item' : 'items'})
                </span>
                <span className="font-display text-lg font-extrabold text-white leading-tight">
                  {formatINR(subtotal)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md">
              <span>View Quote</span>
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>
      )}

      {/* 5. Mobile & Tablet Bottom Sheet Drawer Modal */}
      {isMobileCartOpen && activeStaff && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <div className="relative z-10 w-full max-h-[90vh] bg-slate-50 rounded-t-[2.5rem] p-4 sm:p-6 overflow-y-auto shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            <QuoteCart
              selectedProducts={selectedProducts}
              staff={activeStaff}
              onRemoveProduct={handleRemoveProduct}
              onClearCart={handleClearCart}
              onCloseMobile={() => setIsMobileCartOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
