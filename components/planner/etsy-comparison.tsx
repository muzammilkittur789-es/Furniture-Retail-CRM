'use client';

import React from 'react';
import { Check, X, Sparkles, Zap, Shield, BookOpen } from 'lucide-react';

export function EtsyComparison() {
  const comparisonItems = [
    {
      feature: 'iPad Orientation Freedom',
      etsy: 'Locked to 1 format. Must buy two separate 500-page files for Portrait vs Landscape.',
      aura: 'Dual Orientation freedom. Generate Portrait (handheld clipboard) or Landscape (dual-page desk spread) with 1 click.',
    },
    {
      feature: 'File Size & GoodNotes Performance',
      etsy: '100MB – 150MB bloated PDFs with 50,000 links. Causes GoodNotes lag and battery drain.',
      aura: 'Ultra-light 2MB – 5MB vector stream. Instant 120Hz page flipping, zero lag on any iPad.',
    },
    {
      feature: 'Start Day Flexibility',
      etsy: 'Fixed. Changing Monday to Sunday requires downloading completely different Google Drive archives.',
      aura: 'Real-time toggle. Switch Monday or Sunday start instantly with live calendar recalculation.',
    },
    {
      feature: 'Template Bloat vs Deep Focus',
      etsy: 'Overwhelming 500+ generic templates (plant trackers, party planners) that clutter your index.',
      aura: 'Curated Zen: Only essential Daily Focus, Weekly Cadence, Monthly Spreads, and Habit Matrix.',
    },
    {
      feature: 'Apple Pencil Vector Precision',
      etsy: 'Raster images pixelate when zoomed in. Fuzzy lines on iPad Pro retina screens.',
      aura: '100% Vector rules, dots, and typography. Infinite razor-sharp clarity at 500% zoom.',
    },
  ];

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm max-w-5xl mx-auto my-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-bold block mb-1">
          Market Comparison
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
          Why Aura Fills What Etsy Star Sellers Miss
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal">
          Designed specifically to solve the top 5 complaints from thousands of Etsy digital planner buyers.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-4 px-4 font-semibold w-1/3">Core Experience</th>
              <th className="py-4 px-4 font-semibold w-1/3 text-rose-600 bg-rose-50/50 rounded-t-xl">
                Etsy Star Sellers
              </th>
              <th className="py-4 px-4 font-semibold w-1/3 text-indigo-700 bg-indigo-50/60 rounded-t-xl">
                Aura Planner Studio
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisonItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-900">
                  {item.feature}
                </td>
                <td className="py-4 px-4 text-slate-600 bg-rose-50/20 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item.etsy}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-900 bg-indigo-50/30 font-medium leading-relaxed">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>{item.aura}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
