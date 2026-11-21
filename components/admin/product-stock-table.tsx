'use client';

import React, { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import {
  toggleProductStockStatus,
  addProductStockAction,
  deleteProductStockAction,
} from '@/app/(admin)/admin/actions';
import { Product } from '@/lib/types/database';
import {
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Search,
  CheckCircle2,
  Sparkles,
  PackagePlus,
  Image as ImageIcon,
  Camera,
  Upload,
  RotateCcw,
} from 'lucide-react';

interface ProductStockTableProps {
  initialProducts: Product[];
}

export function ProductStockTable({ initialProducts }: ProductStockTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // New product form states
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newDimensions, setNewDimensions] = useState('');
  const [newMoreInfo, setNewMoreInfo] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Living Room');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      showFeedback('Photo is too large. Please select an image under 12MB.', 'error');
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

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.dimensions.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // 1. Toggle In Stock / Sold
  const handleToggle = (productId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setUpdatingId(productId);

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_active: nextStatus } : p))
    );

    startTransition(async () => {
      const res = await toggleProductStockStatus(productId, nextStatus);
      if (!res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, is_active: currentStatus } : p))
        );
        showFeedback(res.error || 'Failed to update stock status', 'error');
      } else {
        showFeedback(
          nextStatus ? 'Status updated to In Stock' : 'Status updated to Sold (Orange badge)'
        );
      }
      setUpdatingId(null);
    });
  };

  // 2. Add New Furniture Stock
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newPrice || !newMaterial.trim() || !newDimensions.trim()) {
      showFeedback('Please fill out all fields.', 'error');
      return;
    }

    if (!newImageUrl) {
      showFeedback('Please choose a photo from your mobile gallery.', 'error');
      return;
    }

    startTransition(async () => {
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
        showFeedback(`"${res.product.name}" added to stock successfully!`);
      } else {
        showFeedback(res.error || 'Failed to add product.', 'error');
      }
    });
  };

  // 3. Confirm Delete Product
  const handleConfirmDelete = () => {
    if (!deleteConfirmProduct) return;
    const target = deleteConfirmProduct;

    startTransition(async () => {
      const res = await deleteProductStockAction(target.id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== target.id));
        setDeleteConfirmProduct(null);
        showFeedback(`"${target.name}" removed from stock.`);
      } else {
        showFeedback(res.error || 'Failed to delete product.', 'error');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Action Bar: Search & "+ Add Furniture Stock" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search furniture piece by name or material..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition"
        >
          <span>+ Add New Furniture Stock</span>
        </button>
      </div>

      {/* Mobile Card Layout (Visible on screens < 768px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
        {filteredProducts.map((p) => {
          const isThisUpdating = updatingId === p.id && isPending;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  {p.category && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 whitespace-nowrap mb-1">
                      {p.category}
                    </span>
                  )}
                  <h3 className="font-display font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.material}</p>
                  {p.more_info && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200 mt-1 line-clamp-1">
                      {p.more_info}
                    </span>
                  )}
                  <p className="text-sm font-display font-extrabold text-slate-900 mt-1">
                    {formatINR(Number(p.price))}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Interactive Status Badge Button */}
                <button
                  type="button"
                  disabled={isThisUpdating}
                  onClick={() => handleToggle(p.id, p.is_active)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer border ${
                    p.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
                  }`}
                  title="Tap to toggle In Stock / Sold"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      p.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'
                    }`}
                  />
                  <span>{p.is_active ? 'In Stock' : 'Sold'}</span>
                  {isThisUpdating && (
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin ml-1" />
                  )}
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setDeleteConfirmProduct(p)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Delete furniture stock"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / Tablet Table Layout (Visible on md: and up) */}
      <div className="hidden md:block bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-900">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Furniture Item</th>
                <th className="py-4 px-6">Material</th>
                <th className="py-4 px-6">Dimensions</th>
                <th className="py-4 px-6 text-right">Price</th>
                <th className="py-4 px-6 text-center">Stock Status (Tap to Change)</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isThisUpdating = updatingId === p.id && isPending;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          {p.category && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 whitespace-nowrap mb-1">
                              {p.category}
                            </span>
                          )}
                          <span className="font-display font-bold text-base text-slate-900 block">
                            {p.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs font-medium">
                      {p.material}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div className="font-mono">{p.dimensions}</div>
                      {p.more_info && (
                        <span className="inline-block mt-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {p.more_info}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-display text-base font-extrabold text-slate-900 whitespace-nowrap">
                      {formatINR(Number(p.price))}
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isThisUpdating}
                        onClick={() => handleToggle(p.id, p.is_active)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer border ${
                          p.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
                        }`}
                        title="Click to toggle between In Stock and Sold"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'
                          }`}
                        />
                        <span>{p.is_active ? 'In Stock' : 'Sold'}</span>
                        {isThisUpdating && (
                          <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin ml-1" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmProduct(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW FURNITURE STOCK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                <PackagePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-900">
                  Add New Furniture Stock
                </h3>
                <p className="text-xs text-slate-500">
                  Add a new furniture item to the Alishan Furnitures inventory.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono font-bold"
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
                  <span className="text-[10px] text-indigo-600 font-bold">From Mobile Gallery</span>
                </label>

                {/* Hidden native file input for mobile gallery / camera */}
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md active:scale-95 transition flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4 text-indigo-600" />
                        <span>Change Photo</span>
                      </button>
                    </div>
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
                      Choose Photo from Mobile Gallery
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Tap to select photo from phone gallery or take new picture
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save to Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM AGAIN BEFORE DELETING */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 stroke-[2]" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-slate-900 mb-2">
              Confirm Furniture Deletion
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900 font-bold">
                &ldquo;{deleteConfirmProduct.name}&rdquo;
              </strong>{' '}
              from Alishan Furnitures catalog? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
              >
                No, Keep Product
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
