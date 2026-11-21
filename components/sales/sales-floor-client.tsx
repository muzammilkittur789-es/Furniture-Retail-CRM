'use client';

import React, { useState, useMemo, useRef, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, StaffSession, FollowUpLead } from '@/lib/types/database';
import { PinPadModal } from '@/components/sales/pin-pad-modal';
import { ProductGrid } from '@/components/sales/product-grid';
import { QuoteCart } from '@/components/sales/quote-cart';
import { SalesmanFollowupsView } from '@/components/sales/salesman-followups-view';
import { addProductStockAction } from '@/app/(sales)/sales/actions';
import { formatINR } from '@/lib/utils';
import { LiveClock } from '@/components/common/live-clock';
import { Lock, ShoppingBag, ChevronUp, Armchair, PhoneCall, Plus, Camera, X, ArrowLeft } from 'lucide-react';

interface SalesFloorClientProps {
  initialProducts: Product[];
  initialFollowUps?: FollowUpLead[];
}

export function SalesFloorClient({
  initialProducts,
  initialFollowUps = [],
}: SalesFloorClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeStaff, setActiveStaff] = useState<StaffSession | null>(null);
  const isLocked = activeStaff === null;

  const [activeTab, setActiveTab] = useState<'catalog' | 'followups'>('catalog');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Salesperson Add Furniture Stock Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newDimensions, setNewDimensions] = useState('');
  const [newMoreInfo, setNewMoreInfo] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Living Room');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingPending, startAddTransition] = useTransition();

  // Show "Back to Admin" button ONLY if viewer is Showroom Owner/Admin
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hasAdminParam = params.get('from') === 'admin';
      const hasAdminSession = Boolean(sessionStorage.getItem('atelier_admin_session'));
      if (hasAdminParam || hasAdminSession) {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 12MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newPrice || !newMaterial.trim() || !newDimensions.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (!newImageUrl) {
      alert('Please choose a photo from your mobile gallery or take a picture.');
      return;
    }

    startAddTransition(async () => {
      const res = await addProductStockAction({
        name: newName,
        price: Number(newPrice),
        material: newMaterial,
        dimensions: newDimensions,
        more_info: newMoreInfo.trim() || undefined,
        image_url: newImageUrl,
        category: newCategory,
        is_active: true,
      });

      if (res.success && res.product) {
        setProducts((prev) => [res.product!, ...prev]);
        setIsAddModalOpen(false);
        setNewName('');
        setNewPrice('');
        setNewMaterial('');
        setNewDimensions('');
        setNewMoreInfo('');
        setNewImageUrl('');
        setNewCategory('Living Room');
      } else {
        alert(res.error || 'Failed to add product to stock.');
      }
    });
  };

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

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(50, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleToggleProduct = (product: Product) => {
    setSelectedProductIds((prev) => {
      const isAlreadySelected = prev.includes(product.id);
      if (isAlreadySelected) {
        setQuantities((q) => {
          const next = { ...q };
          delete next[product.id];
          return next;
        });
        return prev.filter((id) => id !== product.id);
      } else {
        setQuantities((q) => ({ ...q, [product.id]: 1 }));
        return [...prev, product.id];
      }
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    setQuantities((q) => {
      const next = { ...q };
      delete next[productId];
      return next;
    });
  };

  const handleClearCart = () => {
    setSelectedProductIds([]);
    setQuantities({});
    setIsMobileCartOpen(false);
  };

  const selectedProducts = products.filter((p) =>
    selectedProductIds.includes(p.id)
  );

  const totalItemsCount = useMemo(() => {
    return selectedProducts.reduce((sum, item) => sum + (quantities[item.id] || 1), 0);
  }, [selectedProducts, quantities]);

  const subtotal = useMemo(() => {
    return selectedProducts.reduce(
      (sum, item) => sum + Number(item.price) * (quantities[item.id] || 1),
      0
    );
  }, [selectedProducts, quantities]);

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

          {/* Current Date & Time Clock (Tablet & Desktop) */}
          <div className="hidden sm:flex items-center">
            <LiveClock variant="button" showSeconds={false} />
          </div>

          {/* Actions & Staff Session */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Back to Admin Dashboard Button (ONLY visible when Admin/Owner is browsing) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition active:scale-95 shadow-2xs shrink-0"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Back to Admin</span>
                <span className="sm:hidden text-[11px]">Admin</span>
              </Link>
            )}

            {/* Active Sales Staff Session & Lock Action */}
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

        {/* Current Date & Time Banner (Mobile Screen) */}
        <div className="sm:hidden flex items-center justify-center py-2 px-4 bg-slate-50 border-t border-slate-100">
          <LiveClock variant="button" showSeconds={false} className="py-1 px-3 text-[11px]" />
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
              <div className="mb-5 sm:mb-6 flex items-start justify-between gap-3 flex-wrap">
                <div>
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

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Stock</span>
                </button>
              </div>

              <ProductGrid
                products={products}
                selectedProductIds={selectedProductIds}
                onToggleProduct={handleToggleProduct}
              />
            </div>

            {/* Right Column: Sticky Quote Cart on Desktop */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-24">
              {activeStaff && (
                <QuoteCart
                  selectedProducts={selectedProducts}
                  quantities={quantities}
                  onUpdateQuantity={handleUpdateQuantity}
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
                  {totalItemsCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold block">
                  Current Quote ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
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
              quantities={quantities}
              onUpdateQuantity={handleUpdateQuantity}
              staff={activeStaff}
              onRemoveProduct={handleRemoveProduct}
              onClearCart={handleClearCart}
              onCloseMobile={() => setIsMobileCartOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 6. Salesperson Add New Furniture Stock Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
                  Add New Furniture Stock
                </h3>
                <p className="text-xs text-slate-500">
                  Add floor piece directly to showroom inventory.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Furniture Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Nordic Oak 6-Seater Dining Table"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g. 185000"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dimensions (Size)
                </label>
                <input
                  type="text"
                  required
                  value={newDimensions}
                  onChange={(e) => setNewDimensions(e.target.value)}
                  placeholder="e.g. 200cm x 95cm x 76cm"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Furniture Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white font-medium"
                >
                  <option value="Living Room">Living Room (Sofas, Recliners, Accent Chairs)</option>
                  <option value="Dining Room">Dining Room (Dining Tables &amp; Chair Sets)</option>
                  <option value="Bedroom">Bedroom (Beds, Wardrobes &amp; Dressers)</option>
                  <option value="Coffee Tables & Storage">Coffee Tables &amp; Storage (Tables, Consoles)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Material &amp; Finish
                </label>
                <input
                  type="text"
                  required
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="e.g. Solid European White Oak &amp; Natural Oil Finish"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  More Info
                </label>
                <input
                  type="text"
                  value={newMoreInfo}
                  onChange={(e) => setNewMoreInfo(e.target.value)}
                  placeholder="e.g. King Size / 3-Seater / Reversible Chaise / 6-Seater"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              {/* Photo Chooser from Mobile Gallery / Camera */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Furniture Photo</span>
                  <span className="text-[10px] text-indigo-600 font-bold">From Phone Gallery</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />

                {newImageUrl ? (
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-indigo-300 bg-slate-100 shadow-sm group">
                    <Image
                      src={newImageUrl}
                      alt="Selected furniture"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-sm text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 p-6 flex flex-col items-center justify-center cursor-pointer transition text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 shadow-sm border border-indigo-100 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Camera className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-indigo-950">
                      Choose Photo from Gallery or Camera
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Tap to select photo from phone gallery or take camera picture
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition whitespace-nowrap text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPending}
                  className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Add to Floor Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
