'use client';

import React from 'react';
import {
  PlannerConfig,
  PreviewTab,
  THEME_PALETTES,
  MONTH_SHORT,
  MONTH_NAMES,
} from '@/lib/planner-types';
import {
  Smartphone,
  Tablet,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface IpadPreviewProps {
  config: PlannerConfig;
  activePreviewTab: PreviewTab;
  onSelectPreviewTab: (tab: PreviewTab) => void;
  onToggleOrientation: (orientation: 'portrait' | 'landscape') => void;
}

export function IpadPreview({
  config,
  activePreviewTab,
  onSelectPreviewTab,
  onToggleOrientation,
}: IpadPreviewProps) {
  const isLandscape = config.orientation === 'landscape';
  const palette = THEME_PALETTES[config.theme] || THEME_PALETTES.linen;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Preview Controls Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 px-2">
        {/* Orientation Switcher Pill */}
        <div className="inline-flex items-center p-1 bg-slate-200/80 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => onToggleOrientation('portrait')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isLandscape
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 Portrait (Handheld)</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleOrientation('landscape')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isLandscape
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>💻 Landscape (Desk Spread)</span>
          </button>
        </div>

        {/* Quick Page View Switcher in Preview */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs font-semibold text-slate-600">
          {(['cover', 'year', 'month', 'day', 'habits', 'notes'] as PreviewTab[]).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onSelectPreviewTab(tab)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                  activePreviewTab === tab
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {/* Realistic iPad Pro Hardware Chassis */}
      <div
        className={`relative transition-all duration-300 ease-out rounded-[40px] p-3 sm:p-4 bg-slate-900 border-[8px] sm:border-[10px] border-slate-800 shadow-2xl ${
          isLandscape
            ? 'w-full max-w-[780px] aspect-[4/3]'
            : 'w-full max-w-[560px] aspect-[3/4]'
        }`}
      >
        {/* iPad Top Camera Dot */}
        <div
          className={`absolute z-30 w-2.5 h-2.5 rounded-full bg-slate-950/80 border border-slate-700/50 shadow-inner ${
            isLandscape
              ? 'top-1.5 left-1/2 -translate-x-1/2'
              : 'top-1.5 left-1/2 -translate-x-1/2'
          }`}
        />

        {/* iPad Screen Interior (Tactile Paper Canvas) */}
        <div
          className="relative w-full h-full rounded-[24px] overflow-hidden flex shadow-inner transition-colors duration-200 select-none"
          style={{
            backgroundColor: palette.paperHex,
            color: palette.textHex,
          }}
        >
          {/* Main Planner Page Content */}
          <div className="flex-1 h-full p-4 sm:p-6 overflow-hidden flex flex-col justify-between">
            {/* 1. COVER PREVIEW */}
            {activePreviewTab === 'cover' && (
              <div className="h-full flex flex-col items-center justify-center text-center border border-dashed rounded-2xl p-6"
                style={{ borderColor: palette.borderHex }}
              >
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-2"
                  style={{ color: palette.accentHex }}
                >
                  Bespoke iPad Digital Planner
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2 font-serif">
                  A U R A
                </h1>
                <p className="text-xs sm:text-sm font-medium mb-6" style={{ color: palette.mutedHex }}>
                  {config.year === 'undated' ? 'UNDATED' : config.year} • {isLandscape ? 'DUAL SPREAD' : 'PORTRAIT'}
                </p>
                <div className="w-16 h-0.5 mb-8" style={{ backgroundColor: palette.accentHex }} />
                <p className="text-[11px] font-mono" style={{ color: palette.mutedHex }}>
                  Belongs To: Your Name
                </p>
              </div>
            )}

            {/* 2. YEAR AT A GLANCE PREVIEW */}
            {activePreviewTab === 'year' && (
              <div className="h-full flex flex-col">
                <div className="flex items-baseline justify-between mb-3 border-b pb-2"
                  style={{ borderColor: palette.borderHex }}
                >
                  <h2 className="text-sm sm:text-base font-extrabold font-serif">
                    {config.year} CALENDAR OVERVIEW
                  </h2>
                  <span className="text-[10px] uppercase font-bold" style={{ color: palette.accentHex }}>
                    Interactive Jump Grid
                  </span>
                </div>
                <div className={`grid gap-2 flex-1 ${isLandscape ? 'grid-cols-4 grid-rows-3' : 'grid-cols-3 grid-rows-4'}`}>
                  {MONTH_NAMES.map((mName, i) => (
                    <div
                      key={mName}
                      onClick={() => onSelectPreviewTab('month')}
                      className="p-1.5 sm:p-2 rounded-lg border flex flex-col justify-between cursor-pointer hover:opacity-80 transition"
                      style={{ borderColor: palette.borderHex, backgroundColor: palette.tabHex }}
                    >
                      <span className="text-[10px] sm:text-xs font-bold font-serif" style={{ color: palette.accentHex }}>
                        {mName}
                      </span>
                      <div className="grid grid-cols-7 gap-0.5 text-[7px] text-center opacity-70">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, dIdx) => (
                          <span key={dIdx} className="font-semibold">{d}</span>
                        ))}
                      </div>
                      <span className="text-[8px] text-right font-mono" style={{ color: palette.mutedHex }}>
                        Tap to jump →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MONTHLY SPREAD PREVIEW */}
            {activePreviewTab === 'month' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold font-serif">
                      JANUARY {config.year}
                    </h2>
                    <span className="text-[9px] font-medium" style={{ color: palette.mutedHex }}>
                      {config.startDay === 'monday' ? 'Monday Start' : 'Sunday Start'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectPreviewTab('day')}
                    className="text-[9px] font-bold px-2 py-1 rounded-md"
                    style={{ backgroundColor: palette.tabHex, color: palette.accentHex }}
                  >
                    View Day 1 →
                  </button>
                </div>

                <div className={`flex-1 flex gap-3 ${isLandscape ? 'flex-row' : 'flex-col'}`}>
                  {/* Calendar Grid */}
                  <div className={`flex-1 border rounded-xl p-2 flex flex-col justify-between`}
                    style={{ borderColor: palette.borderHex }}
                  >
                    <div className="grid grid-cols-7 text-[8px] sm:text-[9px] text-center font-bold pb-1 border-b"
                      style={{ borderColor: palette.borderHex, color: palette.mutedHex }}
                    >
                      {config.startDay === 'monday'
                        ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                            <span key={d}>{d}</span>
                          ))
                        : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                            <span key={d}>{d}</span>
                          ))}
                    </div>
                    <div className="grid grid-cols-7 grid-rows-5 gap-1 flex-1 pt-1 text-[8px] sm:text-[10px] font-bold">
                      {Array.from({ length: 31 }).map((_, i) => (
                        <div
                          key={i}
                          onClick={() => onSelectPreviewTab('day')}
                          className="border border-dashed rounded p-1 flex items-start justify-between hover:bg-black/5 cursor-pointer"
                          style={{ borderColor: palette.borderHex }}
                        >
                          <span>{i + 1}</span>
                          {i === 0 && (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.accentHex }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Landscape Right Page: Monthly Goals */}
                  {isLandscape && (
                    <div className="w-[38%] border rounded-xl p-3 flex flex-col justify-between"
                      style={{ borderColor: palette.borderHex }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: palette.accentHex }}>
                        Monthly Goals &amp; Habits
                      </span>
                      <div className="space-y-2 flex-1 pt-2">
                        {[1, 2, 3, 4, 5, 6].map((g) => (
                          <div key={g} className="flex items-center gap-2 text-[9px] border-b pb-1"
                            style={{ borderColor: palette.borderHex }}
                          >
                            <span className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: palette.accentHex }} />
                            <span className="text-slate-400 font-mono">Priority goal {g}...</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. DAILY PAGE PREVIEW */}
            {activePreviewTab === 'day' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2 pb-1 border-b"
                  style={{ borderColor: palette.borderHex }}
                >
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-sm sm:text-base font-extrabold font-serif">
                      WEDNESDAY, JAN 15
                    </h2>
                    <span className="text-[9px] uppercase font-bold" style={{ color: palette.accentHex }}>
                      Day 15 / 365
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold">
                    <button type="button" onClick={() => onSelectPreviewTab('month')} style={{ color: palette.accentHex }}>
                      ← JAN
                    </button>
                    <span>|</span>
                    <button type="button" onClick={() => onSelectPreviewTab('habits')} style={{ color: palette.accentHex }}>
                      HABITS →
                    </button>
                  </div>
                </div>

                <div className={`flex-1 flex gap-3 ${isLandscape ? 'flex-row' : 'flex-col'}`}>
                  {/* Left Column: Priorities & 6AM - 10PM Schedule */}
                  <div className={`flex-1 flex flex-col gap-2 ${isLandscape ? 'w-1/2' : 'w-full'}`}>
                    <div className="border rounded-xl p-2" style={{ borderColor: palette.borderHex }}>
                      <span className="text-[9px] font-bold uppercase tracking-wider block mb-1" style={{ color: palette.accentHex }}>
                        ★ Top 3 Daily Priorities
                      </span>
                      <div className="space-y-1 text-[8px]">
                        <div>1. Finalize Q1 Strategy Deck</div>
                        <div>2. 45-min Deep Focus Workout</div>
                        <div>3. Evening Review &amp; Journal</div>
                      </div>
                    </div>

                    <div className="flex-1 border rounded-xl p-2 flex flex-col justify-between"
                      style={{ borderColor: palette.borderHex }}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider block mb-1" style={{ color: palette.accentHex }}>
                        Schedule (6:00 AM - 9:00 PM)
                      </span>
                      <div className="space-y-1 text-[8px] font-mono flex-1">
                        {[6, 8, 10, 12, 14, 16, 18, 20].map((hour) => (
                          <div key={hour} className="flex items-center gap-2 border-b border-dashed pb-0.5"
                            style={{ borderColor: palette.borderHex }}
                          >
                            <span className="w-10 opacity-70">
                              {hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                            </span>
                            <span className="text-slate-400">..............................</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Checklist & Dot Grid Brain Dump */}
                  <div className={`flex-1 flex flex-col gap-2 ${isLandscape ? 'w-1/2' : 'w-full'}`}>
                    <div className="border rounded-xl p-2" style={{ borderColor: palette.borderHex }}>
                      <span className="text-[9px] font-bold uppercase tracking-wider block mb-1" style={{ color: palette.accentHex }}>
                        ✓ Action Checklist
                      </span>
                      <div className="space-y-1 text-[8px]">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Morning meditation &amp; hydration</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: palette.borderHex }} />
                          <span>Review marketing budget</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: palette.borderHex }} />
                          <span>Respond to high-priority emails</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 border rounded-xl p-2 flex flex-col justify-between"
                      style={{ borderColor: palette.borderHex }}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider block mb-1" style={{ color: palette.accentHex }}>
                        Apple Pencil Scratchpad &amp; Grid
                      </span>
                      <div className="flex-1 rounded border border-dashed flex items-center justify-center text-[9px] font-mono opacity-50"
                        style={{ borderColor: palette.borderHex }}
                      >
                        [ 5mm Minimal Dot Grid Area ]
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. HABITS MATRIX PREVIEW */}
            {activePreviewTab === 'habits' && (
              <div className="h-full flex flex-col">
                <div className="flex items-baseline justify-between mb-2 pb-1 border-b"
                  style={{ borderColor: palette.borderHex }}
                >
                  <h2 className="text-sm sm:text-base font-extrabold font-serif">
                    31-DAY HABIT MATRIX
                  </h2>
                  <span className="text-[9px] uppercase font-bold" style={{ color: palette.accentHex }}>
                    Daily Consistency
                  </span>
                </div>
                <div className="flex-1 border rounded-xl p-2 flex flex-col justify-between"
                  style={{ borderColor: palette.borderHex }}
                >
                  <div className="space-y-2 text-[8px]">
                    {[
                      'Hydration (2.5L)',
                      '7,000 Steps Daily',
                      'Reading 20 Pages',
                      'No Sugar After 8 PM',
                      'Daily Gratitude Entry',
                    ].map((habit, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b pb-1"
                        style={{ borderColor: palette.borderHex }}
                      >
                        <span className="font-semibold">{habit}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 15 }).map((_, d) => (
                            <span
                              key={d}
                              className={`w-2 h-2 rounded-full border ${
                                (d + idx) % 3 === 0 ? 'bg-amber-500 border-amber-500' : ''
                              }`}
                              style={{ borderColor: palette.borderHex }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-[8px] text-center font-mono opacity-60">
                    ...full 31 days rendered across every monthly tab in the exported PDF
                  </span>
                </div>
              </div>
            )}

            {/* 6. NOTES PREVIEW */}
            {activePreviewTab === 'notes' && (
              <div className="h-full flex flex-col">
                <div className="flex items-baseline justify-between mb-2 pb-1 border-b"
                  style={{ borderColor: palette.borderHex }}
                >
                  <h2 className="text-sm sm:text-base font-extrabold font-serif">
                    MINIMAL 5MM DOT GRID NOTEBOOK
                  </h2>
                  <span className="text-[9px] uppercase font-bold" style={{ color: palette.accentHex }}>
                    Apple Pencil Ready
                  </span>
                </div>
                <div className="flex-1 border rounded-xl p-3 flex items-center justify-center text-center"
                  style={{ borderColor: palette.borderHex }}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-serif font-bold">Infinite Resolution Vector Dots</p>
                    <p className="text-[10px] opacity-70">
                      Perfect for GoodNotes / Notability handwriting with zero lag and instant zoom.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hyperlinked Edge Cut-Tabs Along Right Edge */}
          <div
            className="w-8 sm:w-10 h-full border-l flex flex-col justify-between py-2 items-center"
            style={{
              backgroundColor: palette.tabHex,
              borderColor: palette.borderHex,
            }}
          >
            {MONTH_SHORT.map((m, idx) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelectPreviewTab('month')}
                className="w-full text-[7px] sm:text-[8px] font-bold py-1 text-center hover:opacity-100 transition-opacity"
                style={{
                  color: idx === 0 ? palette.accentHex : palette.textHex,
                  opacity: idx === 0 ? 1 : 0.65,
                }}
                title={`Jump to ${m}`}
              >
                {m}
              </button>
            ))}
            <div className="w-4 h-0.5 my-1" style={{ backgroundColor: palette.borderHex }} />
            <button
              type="button"
              onClick={() => onSelectPreviewTab('habits')}
              className="text-[7px] sm:text-[8px] font-bold py-0.5 text-center"
              style={{ color: palette.accentHex }}
            >
              HAB
            </button>
            <button
              type="button"
              onClick={() => onSelectPreviewTab('notes')}
              className="text-[7px] sm:text-[8px] font-bold py-0.5 text-center"
              style={{ color: palette.accentHex }}
            >
              NOTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
