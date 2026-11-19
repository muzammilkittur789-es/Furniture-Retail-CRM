'use client';

import React from 'react';
import { Download, CheckCircle2, Tablet, Share, FileText, X } from 'lucide-react';
import { GenerationProgress } from '@/lib/pdf-generator';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: GenerationProgress | null;
  downloadUrl: string | null;
  fileName: string;
}

export function DownloadModal({
  isOpen,
  onClose,
  progress,
  downloadUrl,
  fileName,
}: DownloadModalProps) {
  if (!isOpen) return null;

  const isDone = progress?.percent === 100 && downloadUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        {isDone && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center">
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            {isDone ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 stroke-[2]" />
            ) : (
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 mb-1">
            {isDone ? 'Your Bespoke Planner is Ready!' : 'Crafting Your Vector Planner...'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 font-medium">
            {progress?.message || 'Compiling vector sheets and hyperlinked index tabs...'}
          </p>

          {/* Progress Bar */}
          {!isDone && (
            <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden border border-slate-200/80 p-0.5">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress?.percent || 0}%` }}
              />
            </div>
          )}

          {/* Download Action */}
          {isDone && downloadUrl && (
            <div className="space-y-4">
              <a
                href={downloadUrl}
                download={fileName}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-[0.99]"
              >
                <Download className="w-5 h-5" />
                <span>Download {fileName}</span>
              </a>

              {/* 3-Step iPad Import Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  How to Open in GoodNotes &amp; Notability (iPad):
                </span>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <span>Tap <strong>Download</strong> above on your iPad Safari browser.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <span>Tap the Safari Downloads icon <Share className="w-3.5 h-3.5 inline mx-0.5 text-indigo-600" />.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <span>Select <strong>Open in GoodNotes</strong> or <strong>Notability</strong>. Enjoy infinite vector zoom!</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
