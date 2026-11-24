import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function QuoteNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-5 text-slate-500">
          <FileQuestion className="w-6 h-6 stroke-[1.75]" />
        </div>

        <h1 className="font-serif text-2xl font-medium tracking-tight mb-2">
          Quotation Not Found
        </h1>

        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          This quotation link may have expired or the reference
          number is invalid. Please get in touch with your showroom sales team for a renewed
          quote.
        </p>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Alishan Furnitures • Furniture Showroom
          </p>
        </div>
      </div>
    </div>
  );
}
