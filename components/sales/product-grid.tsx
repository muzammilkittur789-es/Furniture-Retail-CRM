'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/lib/types/database';
import { ProductCard } from './product-card';
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedProductIds: string[];
  onToggleProduct: (product: Product) => void;
}

const CATEGORIES = [
  { id: 'All Items', label: 'All Items' },
  { id: 'Sofas & Chairs', label: 'Sofas & Chairs' },
  { id: 'Dining Tables', label: 'Dining Tables' },
  { id: 'Beds', label: 'Beds' },
  { id: 'Cabinets & Sideboards', label: 'Cabinets & Sideboards' },
];

export function ProductGrid({
  products,
  selectedProductIds,
  onToggleProduct,
}: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.dimensions.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(p.more_info && p.more_info.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeCategory === 'All Items') return true;
      if (activeCategory === 'Sofas & Chairs') {
        if (p.category === 'Living Room') return true;
        return p.name.includes('Sectional') || p.name.includes('Chair') || p.name.includes('Sofa');
      }
      if (activeCategory === 'Dining Tables') {
        if (p.category === 'Dining Room') return true;
        return p.name.includes('Table') || p.name.includes('Dining');
      }
      if (activeCategory === 'Beds') {
        if (p.category === 'Bedroom') return true;
        return p.name.includes('Bed');
      }
      if (activeCategory === 'Cabinets & Sideboards') {
        if (p.category === 'Coffee Tables & Storage') return true;
        return p.name.includes('Credenza') || p.name.includes('Cabinet') || p.name.includes('Table');
      }
      return true;
    });
  }, [products, searchQuery, activeCategory]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sofa, dining table, bed, wood, marble..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Pills for Mobile & Tablet Touch Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-slate-100/90 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Grid: 1 col on mobile, 2 col on tablet, 3 col on large desktop */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4.5">
          {filteredProducts.map((product) => {
            const isSelected = selectedProductIds.includes(product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={isSelected}
                onToggle={onToggleProduct}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <p className="font-display font-bold text-base text-slate-800">
            No showroom pieces found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
}
