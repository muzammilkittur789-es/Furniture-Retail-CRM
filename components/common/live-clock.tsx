'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface LiveClockProps {
  variant?: 'light' | 'dark' | 'minimal' | 'button';
  showSeconds?: boolean;
  className?: string;
}

export function LiveClock({
  variant = 'light',
  showSeconds = false,
  className = '',
}: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Initial sync
    setNow(new Date());

    // Update every second
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!now) {
    // Render placeholder with same layout during SSR to prevent layout shift
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium animate-pulse ${
          variant === 'dark'
            ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
            : variant === 'minimal'
            ? 'text-slate-400'
            : 'bg-slate-100 text-slate-500 border border-slate-200/80'
        } ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="text-[11px]">Loading time...</span>
      </div>
    );
  }

  // Format date and time
  const dayName = now.toLocaleDateString('en-IN', { weekday: 'short' });
  const dayDate = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: true,
  });

  if (variant === 'dark') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-200 text-xs shadow-xs ${className}`}
      >
        <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[11px] text-slate-300 font-semibold">
            <span className="hidden sm:inline">{dayName}, </span>
            {dayDate}
          </span>
        </div>
        <span className="text-slate-600 font-bold">•</span>
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono tracking-tight">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[11px]">{timeStr}</span>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium ${className}`}
      >
        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
        <span>
          <span className="hidden sm:inline">{dayName}, </span>
          {dayDate}
        </span>
        <span className="text-slate-300 font-bold">•</span>
        <Clock className="w-3.5 h-3.5 text-emerald-600 ml-1" />
        <span className="font-semibold text-slate-800 font-mono text-[11px]">
          {timeStr}
        </span>
      </div>
    );
  }

  // Button / Light variant (clean tactile button-like card)
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all text-xs text-slate-700 select-none ${className}`}
    >
      <div className="flex items-center gap-1.5 text-indigo-600 font-medium shrink-0">
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] text-slate-800 font-semibold whitespace-nowrap">
          <span className="hidden sm:inline">{dayName}, </span>
          {dayDate}
        </span>
      </div>
      <span className="text-slate-300 font-bold">•</span>
      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold font-mono tracking-tight shrink-0">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] text-slate-900 whitespace-nowrap">{timeStr}</span>
      </div>
    </div>
  );
}
