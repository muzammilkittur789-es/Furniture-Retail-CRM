'use client';

import React from 'react';
import {
  PlannerConfig,
  PlannerOrientation,
  PlannerTheme,
  PlannerYear,
  StartDay,
  DailyLayout,
  WeeklyLayout,
  THEME_PALETTES,
} from '@/lib/planner-types';
import {
  Smartphone,
  Tablet,
  Calendar,
  Sparkles,
  Palette,
  Check,
  CheckSquare,
  Clock,
  Layout,
  Sliders,
  Download,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface PlannerConfiguratorProps {
  config: PlannerConfig;
  onChange: (newConfig: PlannerConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function PlannerConfigurator({
  config,
  onChange,
  onGenerate,
  isGenerating,
}: PlannerConfiguratorProps) {
  const updateConfig = (patch: Partial<PlannerConfig>) => {
    onChange({ ...config, ...patch });
  };

  const updateModule = (key: keyof PlannerConfig['modules']) => {
    onChange({
      ...config,
      modules: {
        ...config.modules,
        [key]: !config.modules[key],
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-8">
      {/* 1. Header & Value Proposition */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Bespoke Vector Engine • Zero Bloat</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
          Aura Planner Studio
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate an ultra-lightweight, bespoke hyperlinked PDF crafted for iPad GoodNotes &amp; Notability.
        </p>
      </div>

      <div className="space-y-6">
        {/* STEP 1: ORIENTATION */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
            1. iPad Orientation
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateConfig({ orientation: 'portrait' })}
              className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                config.orientation === 'portrait'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <Smartphone className={`w-5 h-5 shrink-0 mt-0.5 ${config.orientation === 'portrait' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-xs sm:text-sm block">📱 Portrait</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Handheld clipboard style
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateConfig({ orientation: 'landscape' })}
              className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                config.orientation === 'landscape'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <Tablet className={`w-5 h-5 shrink-0 mt-0.5 ${config.orientation === 'landscape' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-xs sm:text-sm block">💻 Landscape</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Dual-page desk spread
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* STEP 2: YEAR & START DAY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Calendar Year
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['2025', '2026', 'undated'] as PlannerYear[]).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => updateConfig({ year: yr })}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold uppercase transition ${
                    config.year === yr
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Week Start Day
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateConfig({ startDay: 'monday' })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition ${
                  config.startDay === 'monday'
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                Monday Start
              </button>
              <button
                type="button"
                onClick={() => updateConfig({ startDay: 'sunday' })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition ${
                  config.startDay === 'sunday'
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                Sunday Start
              </button>
            </div>
          </div>
        </div>

        {/* STEP 3: STATIONERY COLOR PALETTES */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
            2. Luxury Paper Aesthetic
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(THEME_PALETTES) as PlannerTheme[]).map((themeKey) => {
              const pal = THEME_PALETTES[themeKey];
              const isSelected = config.theme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => updateConfig({ theme: themeKey })}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-full border shadow-2xs shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: pal.paperHex,
                        borderColor: pal.borderHex,
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pal.accentHex }} />
                    </span>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 block leading-tight">
                        {pal.name}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">
                        {pal.id === 'charcoal' ? 'OLED Dark Mode' : 'Warm Archival Paper'}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 4: ZERO BLOAT MODULES */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              3. Modular Pages (Zero Bloat)
            </label>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ⚡ Ultra Fast File (&lt; 5MB)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => updateModule('habits')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                config.modules.habits
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>31-Day Habit Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => updateModule('notes')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                config.modules.notes
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>5mm Dot Grid Notes</span>
            </button>
          </div>
        </div>

        {/* STEP 5: DURATION / GENERATION SPEED */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Planner Scope
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { id: 'sample', label: '1-Month Deep', desc: 'Instant (~2s)' },
              { id: 'quarter', label: 'Q1 Quarter', desc: 'Fast (~4s)' },
              { id: 'full', label: 'Full Year', desc: 'Complete (~8s)' },
            ].map((dur) => (
              <button
                key={dur.id}
                type="button"
                onClick={() => updateConfig({ duration: dur.id as any })}
                className={`py-2 px-2 rounded-xl border text-center transition ${
                  config.duration === dur.id
                    ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">{dur.label}</div>
                <div className={`text-[9px] ${config.duration === dur.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {dur.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Action Button */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={isGenerating}
          onClick={onGenerate}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-display font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Compiling Vector PDF &amp; Hyperlinks...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Generate &amp; Download Bespoke PDF</span>
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            100% Client-Side Vector
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Tested on GoodNotes 6 &amp; Notability
          </span>
        </div>
      </div>
    </div>
  );
}
