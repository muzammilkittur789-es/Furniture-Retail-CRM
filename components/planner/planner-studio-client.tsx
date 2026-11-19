'use client';

import React, { useState } from 'react';
import {
  PlannerConfig,
  PreviewTab,
} from '@/lib/planner-types';
import { generateBespokePlannerPdf, GenerationProgress } from '@/lib/pdf-generator';
import { IpadPreview } from './ipad-preview';
import { PlannerConfigurator } from './planner-configurator';
import { DownloadModal } from './download-modal';
import { EtsyComparison } from './etsy-comparison';
import { Sparkles, Tablet, Download, ShieldCheck, Heart } from 'lucide-react';

const DEFAULT_CONFIG: PlannerConfig = {
  orientation: 'portrait',
  theme: 'linen',
  year: '2025',
  startDay: 'monday',
  dailyLayout: 'structured',
  weeklyLayout: 'horizontal',
  modules: {
    habits: true,
    finance: false,
    goals: true,
    notes: true,
  },
  duration: 'sample', // Fast generation default (1-Month deep sample) so user gets it in 2 seconds
};

export function PlannerStudioClient() {
  const [config, setConfig] = useState<PlannerConfig>(DEFAULT_CONFIG);
  const [activePreviewTab, setActivePreviewTab] = useState<PreviewTab>('month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileName = `Aura_Minimal_Planner_${config.year}_${config.orientation}_${config.theme}_${config.startDay}.pdf`;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsModalOpen(true);
    setProgress({ percent: 5, message: 'Starting vector rendering...' });
    setDownloadUrl(null);

    try {
      const pdfBytes = await generateBespokePlannerPdf(config, (prog) => {
        setProgress(prog);
      });

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
      setIsModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleOrientation = (orientation: 'portrait' | 'landscape') => {
    setConfig((prev) => ({ ...prev, orientation }));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col justify-between selection:bg-amber-200 selection:text-amber-950 font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              A
            </div>
            <div>
              <span className="font-serif text-xl tracking-tight font-extrabold text-slate-900 block leading-tight">
                Aura Studio
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-bold block">
                Minimal iPad Digital Planner
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GoodNotes 6 &amp; Notability Ready</span>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-900/10 active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Studio Workstation */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1">
        {/* Intro Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold text-amber-900 mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Inspired by Top Etsy Star Sellers • Refined for Zero Bloat</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            The Bespoke Digital Planner for iPad
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal">
            Effortlessly switch between <strong>Portrait (handheld clipboard)</strong> and <strong>Landscape (dual desk spread)</strong>.
            True vector hyperlinks, luxury archival paper aesthetics, and under 5MB file size.
          </p>
        </div>

        {/* Studio Grid: Live iPad Mockup (Left) + Configurator (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive iPad Pro Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full sticky top-24">
              <IpadPreview
                config={config}
                activePreviewTab={activePreviewTab}
                onSelectPreviewTab={setActivePreviewTab}
                onToggleOrientation={handleToggleOrientation}
              />
              <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                ✨ Live interactive preview. Click tabs or dates on the iPad screen to flip pages.
              </p>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-5">
            <PlannerConfigurator
              config={config}
              onChange={setConfig}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Etsy Star Seller Gap Comparison Section */}
        <EtsyComparison />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-serif font-bold text-slate-800 text-sm">AURA DIGITAL STATIONERY</p>
        <p>Bespoke hyperlinked vector planners engineered for GoodNotes, Notability, and Apple Pencil.</p>
        <p className="text-[11px] text-slate-400">© 2025 Aura Planner Studio. All rights reserved.</p>
      </footer>

      {/* Live Download Modal */}
      <DownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        progress={progress}
        downloadUrl={downloadUrl}
        fileName={fileName}
      />
    </div>
  );
}
