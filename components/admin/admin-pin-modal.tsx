'use client';

import React, { useState, useTransition } from 'react';
import { StaffSession } from '@/lib/types/database';
import { verifyAdminPin } from '@/app/(admin)/admin/actions';
import { Delete, ShieldCheck, Lock } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onSuccess: (admin: StaffSession) => void;
}

export function AdminPinModal({ isOpen, onSuccess }: AdminPinModalProps) {
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
      const res = await verifyAdminPin(pinToSubmit);
      if (res.success && res.staff) {
        onSuccess(res.staff);
        setPin('');
        setError(null);
      } else {
        setError(res.error || 'Access denied. Valid Owner PIN required.');
        setPin('');
      }
    });
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md bg-white border border-slate-200/90 shadow-2xl rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center select-none text-slate-900 relative my-auto">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 sm:w-32 h-[3px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent rounded-full" />

        {/* Shield Icon Container */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 sm:mb-4 border border-indigo-200/80 shadow-xs">
          <ShieldCheck className="w-7 h-7 stroke-[2]" />
        </div>

        <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-bold mb-1">
          Executive Security Gate
        </span>
        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 text-center tracking-tight">
          Showroom Owner PIN
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6 text-center font-normal max-w-xs">
          Enter 4-digit Master PIN to unlock the CRM & Analytics Suite.
        </p>

        {/* PIN Indicator Dots */}
        <div className="flex items-center gap-4 sm:gap-5 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-300 border ${
                  isFilled
                    ? 'bg-indigo-600 border-indigo-600 scale-125 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-100 border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Status / Error feedback */}
        <div className="h-6 mb-3 flex items-center justify-center">
          {error ? (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200 animate-in fade-in">
              {error}
            </span>
          ) : isPending ? (
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Verifying Authorization...
            </span>
          ) : null}
        </div>

        {/* Number Pad Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[280px] sm:max-w-xs mb-6">
          {digits.map((num) => (
            <button
              key={num}
              type="button"
              disabled={isPending}
              onClick={() => handleDigit(num)}
              className="h-14 sm:h-16 rounded-2xl border border-slate-200/90 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 active:bg-indigo-600 active:text-white transition-all text-xl font-display font-bold text-slate-800 shadow-2xs flex items-center justify-center active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            disabled={isPending || pin.length === 0}
            onClick={handleClear}
            className="h-14 sm:h-16 rounded-2xl border border-transparent hover:bg-slate-100 text-[11px] font-bold tracking-wider uppercase text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center disabled:opacity-30"
          >
            Clear
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDigit('0')}
            className="h-14 sm:h-16 rounded-2xl border border-slate-200/90 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 active:bg-indigo-600 active:text-white transition-all text-xl font-display font-bold text-slate-800 shadow-2xs flex items-center justify-center active:scale-95 disabled:opacity-50"
          >
            0
          </button>

          <button
            type="button"
            disabled={isPending || pin.length === 0}
            onClick={handleBackspace}
            aria-label="Backspace"
            className="h-14 sm:h-16 rounded-2xl border border-slate-200/90 bg-slate-100 hover:bg-slate-200 active:bg-indigo-600 active:text-white transition-all text-slate-700 shadow-2xs flex items-center justify-center active:scale-95 disabled:opacity-30"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick Access */}
        <div className="w-full pt-4 border-t border-slate-100 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">
            Showroom Owner Demo Fast-Key
          </p>
          <button
            type="button"
            onClick={() => {
              setPin('1234');
              submitPin('1234');
            }}
            className="text-xs px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 transition shadow-2xs font-bold flex items-center justify-center gap-2 mx-auto"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Vikram Mehta (PIN: 1234)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
