'use client';

import React, { useState, useTransition } from 'react';
import { StaffSession } from '@/lib/types/database';
import { verifyPin } from '@/app/(sales)/sales/actions';
import { Delete, Lock, ShieldCheck } from 'lucide-react';

interface PinPadModalProps {
  isOpen: boolean;
  onSuccess: (staff: StaffSession) => void;
}

export function PinPadModal({ isOpen, onSuccess }: PinPadModalProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4 || isPending) return;
    setError(null);
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      submitPin(nextPin);
    }
  };

  const handleBackspace = () => {
    if (isPending) return;
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isPending) return;
    setError(null);
    setPin('');
  };

  const submitPin = (pinToSubmit: string) => {
    startTransition(async () => {
      const res = await verifyPin(pinToSubmit);
      if (res.success && res.staff) {
        onSuccess(res.staff);
        setPin('');
        setError(null);
      } else {
        setError(res.error || 'Invalid 4-digit PIN');
        setPin('');
      }
    });
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto font-sans">
      <div className="w-full max-w-sm sm:max-w-md bg-white border border-slate-200/90 shadow-2xl rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 flex flex-col items-center select-none text-slate-900 relative my-auto">
        {/* Top Indigo Bar */}
        <div className="w-12 h-1 bg-indigo-600 rounded-full mb-5" />

        {/* Brand Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-xs border border-indigo-100">
          <Lock className="w-6 h-6 stroke-[2]" />
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 text-center">
          Terminal Unlock
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 text-center font-normal">
          Select or enter your 4-digit consultant PIN
        </p>

        {/* 4 Illuminated Dots */}
        <div className="flex items-center gap-4 sm:gap-5 mb-5">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-300 border ${
                  isFilled
                    ? 'bg-indigo-600 border-indigo-600 scale-125 shadow-brand'
                    : 'bg-slate-100 border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Feedback State */}
        <div className="h-5 mb-3 flex items-center justify-center">
          {error ? (
            <span className="text-[11px] sm:text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-0.5 rounded-full border border-rose-200 animate-in fade-in">
              {error}
            </span>
          ) : isPending ? (
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
              Verifying...
            </span>
          ) : null}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[280px] sm:max-w-xs mb-5">
          {digits.map((num) => (
            <button
              key={num}
              type="button"
              disabled={isPending}
              onClick={() => handleDigit(num)}
              className="h-12 sm:h-14 rounded-2xl border border-slate-200/80 bg-slate-50/80 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:bg-indigo-600 active:text-white transition-all text-lg sm:text-xl font-display font-bold text-slate-800 shadow-2xs flex items-center justify-center active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            disabled={isPending || pin.length === 0}
            onClick={handleClear}
            className="h-12 sm:h-14 rounded-2xl border border-transparent hover:bg-slate-100 text-[11px] font-bold tracking-wider uppercase text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center disabled:opacity-30"
          >
            Clear
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDigit('0')}
            className="h-12 sm:h-14 rounded-2xl border border-slate-200/80 bg-slate-50/80 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:bg-indigo-600 active:text-white transition-all text-lg sm:text-xl font-display font-bold text-slate-800 shadow-2xs flex items-center justify-center active:scale-95 disabled:opacity-50"
          >
            0
          </button>

          <button
            type="button"
            disabled={isPending || pin.length === 0}
            onClick={handleBackspace}
            aria-label="Backspace"
            className="h-12 sm:h-14 rounded-2xl border border-slate-200/80 bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-2xs flex items-center justify-center active:scale-95 disabled:opacity-30"
          >
            <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Security Footnote */}
        <div className="w-full pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Authorized Showroom Sales Staff Only</span>
          </p>
        </div>
      </div>
    </div>
  );
}
