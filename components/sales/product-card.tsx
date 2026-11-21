'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types/database';
import { formatINR } from '@/lib/utils';
import { Check, Plus, Ruler, Sparkles, Lock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggle: (product: Product) => void;
}

// Color Theory: Dynamic soft pastel tags for category clarity
function getCategoryBadge(name: string, material: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('sofa') || lowerName.includes('sectional') || lowerName.includes('chair')) {
    return {
      label: 'Living Room',
      className: 'bg-purple-50 text-purple-700 border-purple-200/80',
    };
  }
  if (lowerName.includes('table') || lowerName.includes('dining')) {
    return {
      label: 'Dining Room',
      className: 'bg-sky-50 text-sky-700 border-sky-200/80',
    };
  }
  if (lowerName.includes('bed')) {
    return {
      label: 'Bedroom',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    };
  }
  return {
    label: 'Furniture',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80',
  };
}

export function ProductCard({ product, isSelected, onToggle }: ProductCardProps) {
  const badge = getCategoryBadge(product.name, product.material);
  const isSold = product.is_active === false;
  const isLocked = Boolean(product.isLocked24h);
  const isUnavailable = isSold || isLocked;

  return (
    <div
      onClick={() => {
        if (!isUnavailable) onToggle(product);
      }}
      className={`group relative flex flex-col justify-between bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
        isSold
          ? 'border-amber-300/80 bg-amber-50/15 shadow-xs cursor-not-allowed opacity-85'
          : isLocked
          ? 'border-amber-300/80 bg-amber-50/20 shadow-xs cursor-not-allowed opacity-90'
          : isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/25 shadow-lg shadow-indigo-500/10 -translate-y-1 cursor-pointer'
          : 'border-slate-200/80 hover:border-indigo-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-xl hover:-translate-y-1 cursor-pointer'
      }`}
    >
      {/* Top Image Showcase */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-100 overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ease-out ${
            isSold ? 'grayscale-[0.4] opacity-80' : isLocked ? 'grayscale-[0.25]' : 'group-hover:scale-105'
          }`}
          priority={false}
        />

        {/* Soft Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />

        {/* Dynamic Category Pastel Pill or Sold / 24h Lock Warning */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {isSold ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1">
              <span>🏷️ Sold Out</span>
            </span>
          ) : (
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide shadow-xs backdrop-blur-sm ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
          {isLocked && !isSold && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold tracking-wide shadow-sm flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>24h Hold</span>
            </span>
          )}
        </div>

        {/* Selection Status Pin or Lock Indicator */}
        <div className="absolute top-2.5 right-2.5">
          {isSold ? (
            <div className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[9px] font-bold shadow-md ring-2 ring-white">
              Sold
            </div>
          ) : isLocked ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500 text-white shadow-md ring-2 ring-white">
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          ) : (
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                isSelected
                  ? 'bg-indigo-600 text-white ring-2 ring-white scale-105'
                  : 'bg-white/95 backdrop-blur-md text-slate-400 border border-slate-200 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:scale-105'
              }`}
            >
              {isSelected ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Plus className="w-4 h-4 stroke-[2]" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {product.category && (
            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md inline-block mb-1 w-fit whitespace-nowrap">
              {product.category}
            </span>
          )}

          <h3
            className={`font-display text-base sm:text-lg font-bold leading-snug line-clamp-1 mb-1 transition-colors ${
              isUnavailable
                ? 'text-slate-700'
                : 'text-slate-900 group-hover:text-indigo-600'
            }`}
          >
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 tracking-tight">
              {formatINR(Number(product.price))}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded-md">
              Tax Included
            </span>
          </div>

          {/* Sold Out Notice */}
          {isSold && (
            <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-300 text-[10px] text-amber-900 font-bold flex items-center gap-1.5">
              <span>🏷️ Sold to another customer.</span>
            </div>
          )}

          {/* 24h Hold Notice If Locked */}
          {isLocked && !isSold && (
            <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[10px] text-amber-900 font-medium flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-600 shrink-0" />
              <span>
                Reserved until{' '}
                <strong className="font-bold">{product.lockedUntil || '24 hrs'}</strong>
              </span>
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[9px]">
                Material:
              </span>
              <span className="line-clamp-1 text-slate-600 font-medium text-[11px]">
                {product.material}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ruler className="w-3 h-3 text-indigo-600 shrink-0" />
              <span className="line-clamp-1 font-mono text-[10px] text-slate-500">
                {product.dimensions}
              </span>
            </div>
            {product.more_info && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[9px]">
                  Spec:
                </span>
                <span className="line-clamp-1 text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                  {product.more_info}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button Touch Target */}
        <div className="mt-3 sm:mt-4 pt-1">
          {isSold ? (
            <div className="w-full py-2.5 px-3 rounded-xl sm:rounded-2xl font-bold text-xs bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-center gap-1.5 select-none shadow-2xs">
              <span>🏷️ Sold Out</span>
            </div>
          ) : isLocked ? (
            <div className="w-full py-2.5 px-3 rounded-xl sm:rounded-2xl font-bold text-xs bg-amber-50 border border-amber-300 text-amber-800 flex items-center justify-center gap-1.5 select-none shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>🔒 24h Hold</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(product);
              }}
              className={`w-full py-2.5 px-3 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] ${
                isSelected
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 shadow-md'
                  : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-800 border border-slate-200/90'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Added</span>
                </>
              ) : (
                <span>+ Add to Quote</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
