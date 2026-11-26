'use client';

import React, { useState, useMemo } from 'react';
import { formatINR } from '@/lib/utils';
import { FullQuoteRecord, SoldProductItem } from './admin-dashboard-client';
import { StaffMember } from '@/lib/store/showroom-store';
import {
  generateExecutiveReportPdfBlob,
  ExecutiveReportPayload,
  ExecutiveReportTableItem,
  ReportStaffPerformance,
} from '@/lib/pdf/executive-report-pdf';
import {
  Calendar,
  Download,
  X,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  PackageCheck,
  Users,
  IndianRupee,
  Sparkles,
} from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: FullQuoteRecord[];
  staffList?: StaffMember[];
  ownerName?: string;
}

const CATALOG_IMAGE_MAP: Record<string, string> = {
  bouclé: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?fm=jpg&fit=crop&w=600&q=80',
  florence: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?fm=jpg&fit=crop&w=600&q=80',
  sectional: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?fm=jpg&fit=crop&w=600&q=80',
  verona: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?fm=jpg&fit=crop&w=600&q=80',
  marble: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?fm=jpg&fit=crop&w=600&q=80',
  dining: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?fm=jpg&fit=crop&w=600&q=80',
  aurelia: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?fm=jpg&fit=crop&w=600&q=80',
  lounge: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?fm=jpg&fit=crop&w=600&q=80',
  kyoto: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?fm=jpg&fit=crop&w=600&q=80',
  bedstead: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?fm=jpg&fit=crop&w=600&q=80',
  tivoli: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?fm=jpg&fit=crop&w=600&q=80',
  travertine: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?fm=jpg&fit=crop&w=600&q=80',
  coffee: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?fm=jpg&fit=crop&w=600&q=80',
  monolith: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?fm=jpg&fit=crop&w=600&q=80',
  credenza: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?fm=jpg&fit=crop&w=600&q=80',
};

function resolveProductImage(rawUrl?: string, productName?: string): string | undefined {
  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
    return rawUrl;
  }
  if (!productName) return undefined;
  const lower = productName.toLowerCase();
  for (const [key, url] of Object.entries(CATALOG_IMAGE_MAP)) {
    if (lower.includes(key)) {
      return url;
    }
  }
  return undefined;
}

export function ExportReportModal({
  isOpen,
  onClose,
  quotes,
  staffList = [],
  ownerName = 'Vikram Mehta (Owner)',
}: ExportReportModalProps) {
  // Helpers to get YYYY-MM-DD
  const formatDateToInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => formatDateToInput(new Date()), []);

  // Default: start of current month to today
  const defaultFromStr = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return formatDateToInput(startOfMonth);
  }, []);

  const [fromDate, setFromDate] = useState<string>(defaultFromStr);
  const [toDate, setToDate] = useState<string>(todayStr);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Quick Preset Handlers
  const handleSetPreset = (preset: 'today' | 'week' | 'month' | 'year' | 'all') => {
    const now = new Date();
    const today = formatDateToInput(now);
    setToDate(today);

    if (preset === 'today') {
      setFromDate(today);
    } else if (preset === 'week') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setFromDate(formatDateToInput(past));
    } else if (preset === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setFromDate(formatDateToInput(startOfMonth));
    } else if (preset === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      setFromDate(formatDateToInput(startOfYear));
    } else if (preset === 'all') {
      setFromDate('2026-01-01');
    }
  };

  // Filter quotes within custom date range [fromDate 00:00:00, toDate 23:59:59]
  const filteredData = useMemo(() => {
    const fromTime = new Date(`${fromDate}T00:00:00`).getTime();
    const toTime = new Date(`${toDate}T23:59:59`).getTime();

    const inRangeQuotes = quotes.filter((q) => {
      const qTime = new Date(q.created_at).getTime();
      return qTime >= fromTime && qTime <= toTime;
    });

    const closed = inRangeQuotes.filter((q) => q.status === 'closed');
    const pending = inRangeQuotes.filter((q) => q.status === 'pending');

    const totalRevenue = closed.reduce((acc, q) => acc + (q.final_price || 0), 0);
    const pendingAmount = pending.reduce((acc, q) => acc + (q.final_price || 0), 0);

    // Extract sold items list
    const soldItems: ExecutiveReportTableItem[] = [];
    closed.forEach((q) => {
      const dateFormatted = new Date(q.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const customerName = q.customer_name || 'Showroom Customer';
      const customerWhatsapp = q.customer_whatsapp;
      const staffName = q.staffName || 'Showroom Staff';

      if (q.quote_items && q.quote_items.length > 0) {
        q.quote_items.forEach((item: any) => {
          const qty = item.quantity || 1;
          const prodName = item.product?.name || q.itemsSummary || 'Furniture Piece';
          const rawImg = item.product?.image_url || (item as any).image_url;
          soldItems.push({
            id: item.id || `sold-${Math.random()}`,
            dateFormatted,
            customerName,
            customerWhatsapp,
            productName: prodName,
            imageUrl: resolveProductImage(rawImg, prodName),
            quantity: qty,
            staffName,
            status: 'sold',
            amount: Number(item.price_at_time || q.final_price),
          });
        });
      } else if ((q as any).items && (q as any).items.length > 0) {
        (q as any).items.forEach((item: any) => {
          const qty = item.quantity || 1;
          const prodName = item.product?.name || item.name || q.itemsSummary || 'Furniture Piece';
          const rawImg = item.product?.image_url || item.image_url;
          soldItems.push({
            id: item.id || `sold-${Math.random()}`,
            dateFormatted,
            customerName,
            customerWhatsapp,
            productName: prodName,
            imageUrl: resolveProductImage(rawImg, prodName),
            quantity: qty,
            staffName,
            status: 'sold',
            amount: Number(item.price_at_time || item.price || q.final_price),
          });
        });
      } else {
        const prodName = q.itemsSummary || 'Furniture Piece';
        soldItems.push({
          id: `sold-${q.id}`,
          dateFormatted,
          customerName,
          customerWhatsapp,
          productName: prodName,
          imageUrl: resolveProductImage(undefined, prodName),
          quantity: q.itemsCount || 1,
          staffName,
          status: 'sold',
          amount: q.final_price,
        });
      }
    });

    const piecesSoldCount = soldItems.reduce((acc, it) => acc + it.quantity, 0);

    // Distinct customer phone numbers
    const distinctVisitors = new Set(
      inRangeQuotes.map((q) => q.customer_whatsapp).filter(Boolean)
    ).size;

    // Staff performance breakdown
    const staffMap = new Map<string, { quotes: number; closed: number; rev: number }>();
    inRangeQuotes.forEach((q) => {
      const sName = q.staffName || 'Showroom Staff';
      const cur = staffMap.get(sName) || { quotes: 0, closed: 0, rev: 0 };
      cur.quotes += 1;
      if (q.status === 'closed') {
        cur.closed += 1;
        cur.rev += q.final_price || 0;
      }
      staffMap.set(sName, cur);
    });

    const staffPerformance: ReportStaffPerformance[] = Array.from(staffMap.entries()).map(
      ([sName, stats]) => ({
        staffName: sName,
        quotesCount: stats.quotes,
        closedDealsCount: stats.closed,
        revenue: stats.rev,
      })
    );

    // Quotations Audit Log list:
    // Only non-sold quotes (Pending or No Deal). If sold, they appear in Sold Furniture Pieces table.
    const reportQuotes: ExecutiveReportTableItem[] = [];
    const nonSoldQuotes = inRangeQuotes.filter((q) => q.status !== 'closed');

    nonSoldQuotes.forEach((q) => {
      const dateFormatted = new Date(q.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const customerName = q.customer_name || 'Showroom Customer';
      const customerWhatsapp = q.customer_whatsapp;
      const staffName = q.staffName || 'Showroom Staff';

      const rawStatus = (q.status || 'pending').toLowerCase();
      // Strictly either 'pending' or 'no deal'
      const quoteStatus: 'pending' | 'no deal' =
        rawStatus === 'no_deal' || rawStatus === 'lost' ? 'no deal' : 'pending';

      if (q.quote_items && q.quote_items.length > 0) {
        q.quote_items.forEach((item: any) => {
          const prodName = item.product?.name || q.itemsSummary || 'Furniture Piece';
          const rawImg = item.product?.image_url || (item as any).image_url;
          reportQuotes.push({
            id: `${q.id}-${item.id || Math.random()}`,
            dateFormatted,
            customerName,
            customerWhatsapp,
            productName: prodName,
            imageUrl: resolveProductImage(rawImg, prodName),
            quantity: item.quantity || 1,
            staffName,
            status: quoteStatus,
            amount: Number(item.price_at_time || q.final_price),
          });
        });
      } else if ((q as any).items && (q as any).items.length > 0) {
        (q as any).items.forEach((item: any) => {
          const prodName = item.product?.name || item.name || q.itemsSummary || 'Furniture Piece';
          const rawImg = item.product?.image_url || item.image_url;
          reportQuotes.push({
            id: `${q.id}-${item.id || Math.random()}`,
            dateFormatted,
            customerName,
            customerWhatsapp,
            productName: prodName,
            imageUrl: resolveProductImage(rawImg, prodName),
            quantity: item.quantity || 1,
            staffName,
            status: quoteStatus,
            amount: Number(item.price_at_time || item.price || q.final_price),
          });
        });
      } else {
        const prodName = q.itemsSummary || 'Furniture Piece';
        reportQuotes.push({
          id: q.id,
          dateFormatted,
          customerName,
          customerWhatsapp,
          productName: prodName,
          imageUrl: resolveProductImage(undefined, prodName),
          quantity: q.itemsCount || 1,
          staffName,
          status: quoteStatus,
          amount: q.final_price,
        });
      }
    });

    return {
      totalRevenue,
      pendingAmount,
      totalVisitors: distinctVisitors,
      quotesCount: inRangeQuotes.length,
      closedDealsCount: closed.length,
      piecesSoldCount,
      soldItems,
      staffPerformance,
      quotes: reportQuotes,
    };
  }, [quotes, fromDate, toDate]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const fromObj = new Date(`${fromDate}T00:00:00`);
      const toObj = new Date(`${toDate}T23:59:59`);

      const formatDateLabel = (d: Date) =>
        d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      const nowFormatted = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const payload: ExecutiveReportPayload = {
        fromDateFormatted: formatDateLabel(fromObj),
        toDateFormatted: formatDateLabel(toObj),
        generatedAtFormatted: nowFormatted,
        ownerName,
        totalRevenue: filteredData.totalRevenue,
        totalVisitors: filteredData.totalVisitors,
        quotesCount: filteredData.quotesCount,
        closedDealsCount: filteredData.closedDealsCount,
        piecesSoldCount: filteredData.piecesSoldCount,
        pendingAmount: filteredData.pendingAmount,
        staffPerformance: filteredData.staffPerformance,
        quotes: filteredData.quotes,
        soldItems: filteredData.soldItems,
      };

      const pdfBlob = await generateExecutiveReportPdfBlob(payload);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Alishan_Executive_Report_${fromDate}_to_${toDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Failed to generate report PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 leading-tight">
              Export Showroom Report (PDF)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any custom date range to export an executive audit document.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
            Quick Date Presets
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleSetPreset('today')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-xs font-semibold text-slate-700 transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset('week')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-xs font-semibold text-slate-700 transition"
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset('month')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-xs font-semibold text-slate-700 transition"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset('year')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-xs font-semibold text-slate-700 transition"
            >
              This Year
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset('all')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-xs font-semibold text-slate-700 transition"
            >
              All Time
            </button>
          </div>
        </div>

        {/* From Date & To Date Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>From Date</span>
            </label>
            <input
              type="date"
              value={fromDate}
              max={toDate || todayStr}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>To Date</span>
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={todayStr}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* Live Filter Summary Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-2 border-b border-slate-200">
            <span>Range Summary:</span>
            <span className="text-indigo-600">
              {fromDate} → {toDate}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-semibold">Revenue</span>
              <span className="font-display font-extrabold text-xs sm:text-sm text-emerald-600 block">
                {formatINR(filteredData.totalRevenue)}
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-semibold">Pieces Sold</span>
              <span className="font-display font-extrabold text-xs sm:text-sm text-slate-900 block">
                {filteredData.piecesSoldCount} units
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-semibold">Closed Deals</span>
              <span className="font-display font-extrabold text-xs sm:text-sm text-slate-900 block">
                {filteredData.closedDealsCount} deals
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-semibold">Quotes</span>
              <span className="font-display font-extrabold text-xs sm:text-sm text-slate-900 block">
                {filteredData.quotesCount}
              </span>
            </div>
          </div>
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>PDF Report downloaded successfully!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition whitespace-nowrap text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isGenerating || !fromDate || !toDate}
            onClick={handleDownloadPdf}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold sm:font-bold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-red-700/20 active:scale-95 transition flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
