'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/utils';
import { MessageSquare, Copy, Check, Send, X, Moon, Clock, Phone } from 'lucide-react';

interface Daily10pmReportModalProps {
  totalPendingAmount: number;
  totalPendingCount: number;
  todayClosedAmount?: number;
  ownerWhatsapp?: string;
}

export function Daily10pmReportModal({
  totalPendingAmount,
  totalPendingCount,
  todayClosedAmount = 450000,
  ownerWhatsapp = '7676482481',
}: Daily10pmReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ownerNumber, setOwnerNumber] = useState<string>(ownerWhatsapp);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alishan_owner_whatsapp');
      if (saved) setOwnerNumber(saved);
    }
  }, []);

  const handleNumberChange = (num: string) => {
    const clean = num.replace(/\D/g, '').slice(0, 10);
    setOwnerNumber(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem('alishan_owner_whatsapp', clean);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Simple, clean English format - No religious words, no heavy jargon
  const rawReportMessage = `*Alishan Furnitures - Daily Closing Report*
📅 Date: ${todayStr} | 10:00 PM

*TODAY'S SUMMARY:*
• Total Quotes Sent: ${totalPendingCount + 2}
• Total Pending Amount: ${formatINR(totalPendingAmount)}
• Deals Sold / Closed: ${formatINR(todayClosedAmount)}

*STAFF QUOTES TODAY:*
1. Arjun Verma: 3 quotes (${formatINR(630000)})
2. Sneha Kapoor: 2 quotes (${formatINR(364500)})

*TOP CUSTOMERS TO CALL TOMORROW:*
• +91 9876543210: ${formatINR(567000)} (Bouclé Sofa)
• +91 9123456789: ${formatINR(220500)} (Dining Table)
• +91 9845012345: ${formatINR(364500)} (Lounge Chair)

*View Full Showroom Dashboard:*
${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/admin`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawReportMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToOwner = () => {
    const targetNumber = ownerNumber.length === 10 ? ownerNumber : ownerWhatsapp;
    const encoded = encodeURIComponent(rawReportMessage);
    window.open(`https://wa.me/91${targetNumber}?text=${encoded}`, '_blank');
  };

  return (
    <>
      {/* Trigger Button on Admin Dashboard */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 active:scale-95"
      >
        <Moon className="w-4 h-4 text-emerald-200" />
        <span>View 10 PM WhatsApp Report</span>
        <span className="bg-emerald-800 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-semibold">
          Daily Summary
        </span>
      </button>

      {/* WhatsApp Message Preview Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Daily 10:00 PM Owner Report
                  </h3>
                  <span className="text-xs text-slate-500">
                    Auto-generated WhatsApp summary sent to showroom owner
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp Chat Simulation Container */}
            <div className="p-6 bg-[#EFEAE2] flex flex-col items-center max-h-[55vh] overflow-y-auto">
              {/* WhatsApp Message Bubble */}
              <div className="relative w-full max-w-md bg-white rounded-2xl rounded-tl-xs p-4 shadow-sm border border-slate-200/80 text-xs sm:text-sm text-slate-900 leading-relaxed font-sans">
                <div className="font-bold text-emerald-800 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                  <span>Alishan Furnitures - Daily Closing Report</span>
                  <span className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    10:00 PM
                  </span>
                </div>

                <div className="space-y-3 font-normal text-slate-800">
                  <p className="text-slate-500 text-xs">
                    📅 Date: <strong className="text-slate-800">{todayStr}</strong> (10:00 PM)
                  </p>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                      Today&apos;s Summary:
                    </div>
                    <div>• Total Quotes Sent: <strong>{totalPendingCount + 2}</strong></div>
                    <div>• Pending Quotes Amount: <strong className="text-indigo-600">{formatINR(totalPendingAmount)}</strong></div>
                    <div>• Deals Closed / Sold: <strong className="text-emerald-600">{formatINR(todayClosedAmount)}</strong></div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                      Staff Performance Today:
                    </div>
                    <div>1. Arjun Verma: 3 quotes ({formatINR(630000)})</div>
                    <div>2. Sneha Kapoor: 2 quotes ({formatINR(364500)})</div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                      Top Customers to Call Tomorrow:
                    </div>
                    <div>• +91 9876543210: {formatINR(567000)} (Bouclé Sofa)</div>
                    <div>• +91 9123456789: {formatINR(220500)} (Dining Table)</div>
                    <div>• +91 9845012345: {formatINR(364500)} (Lounge Chair)</div>
                  </div>

                  <p className="text-xs text-indigo-700 underline font-mono">
                    Open Owner Dashboard: http://localhost:3000/admin
                  </p>
                </div>

                <div className="text-right text-[10px] text-slate-400 mt-2 font-mono">
                  10:00 PM ✓✓
                </div>
              </div>
            </div>

            {/* Owner WhatsApp Number Config & Actions */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Owner WhatsApp Number:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={ownerNumber}
                    onChange={(e) => handleNumberChange(e.target.value)}
                    placeholder="10-digit number"
                    className="w-32 sm:w-36 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendToOwner}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Send WhatsApp to Owner</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
