'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface PrintButtonProps {
  label?: string;
  className?: string;
}

export function PrintButton({
  label = 'Save as PDF',
  className = '',
}: PrintButtonProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`no-print inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98] ${className}`}
    >
      <Download className="w-4 h-4 text-white stroke-[2.5]" />
      <span>{label}</span>
    </button>
  );
}
