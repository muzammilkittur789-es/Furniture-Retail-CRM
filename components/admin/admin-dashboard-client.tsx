'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { PendingQuotesTable, PendingQuoteRow } from './pending-quotes-table';
import { Daily10pmReportModal } from './daily-10pm-report-modal';
import { ExportReportModal } from './export-report-modal';
import { StaffMember } from '@/lib/store/showroom-store';
import { LiveClock } from '@/components/common/live-clock';
import {
  IndianRupee,
  Users,
  FileText,
  Clock,
  ArrowUpRight,
  ChevronRight,
  X,
  PackageCheck,
  ShoppingBag,
  Armchair,
  Phone,
  Calendar,
  Moon,
  FileDown,
} from 'lucide-react';

export type TimeFilter = 'today' | 'week' | 'month' | 'year';

export interface SoldProductItem {
  id: string;
  name: string;
  price: number;
  customer_whatsapp: string;
  staffName: string;
  sold_at: string;
  imageUrl?: string;
  quantity?: number;
}

export interface FullQuoteRecord extends PendingQuoteRow {
  quote_items?: {
    id: string;
    price_at_time: number;
    product: {
      name: string;
      image_url?: string;
    };
  }[];
}

interface AdminDashboardClientProps {
  quotes: FullQuoteRecord[];
  staffList?: StaffMember[];
}

export function AdminDashboardClient({ quotes, staffList = [] }: AdminDashboardClientProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Time-filtered calculation
  const { revenue, soldProducts, piecesSoldCount, customersVisited, quotesGenerated, pendingAmount, pendingQuotes, allPeriodQuotes } =
    useMemo(() => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

      const filtered = quotes.filter((q) => {
        const qTime = new Date(q.created_at).getTime();
        if (timeFilter === 'today') return qTime >= startOfToday;
        if (timeFilter === 'week') return qTime >= sevenDaysAgo;
        if (timeFilter === 'month') return qTime >= startOfMonth;
        if (timeFilter === 'year') return qTime >= startOfYear;
        return true;
      });

      // If sample quotes are within today or need fallback demo spread:
      // When testing with fallback data, ensure today/week/month/year show realistic showroom values
      const closedQuotes = filtered.filter((q) => q.status === 'closed');
      const pendingList = filtered.filter((q) => q.status === 'pending');

      // Calculate sold products list
      const soldItems: SoldProductItem[] = [];
      closedQuotes.forEach((q) => {
        if (q.quote_items && q.quote_items.length > 0) {
          q.quote_items.forEach((item: any) => {
            const qty = item.quantity || 1;
            soldItems.push({
              id: item.id,
              name: item.product?.name || q.itemsSummary,
              price: Number(item.price_at_time || q.final_price),
              customer_whatsapp: q.customer_whatsapp,
              staffName: q.staffName,
              sold_at: q.created_at,
              imageUrl: item.product?.image_url,
              quantity: qty,
            });
          });
        } else if ((q as any).items && (q as any).items.length > 0) {
          (q as any).items.forEach((item: any) => {
            const qty = item.quantity || 1;
            soldItems.push({
              id: item.id,
              name: item.product?.name ? `${item.product.name}${qty > 1 ? ` (x${qty})` : ''}` : q.itemsSummary,
              price: Number(item.price_at_time ? item.price_at_time * qty : q.final_price),
              customer_whatsapp: q.customer_whatsapp,
              staffName: q.staffName,
              sold_at: q.created_at,
              imageUrl: item.product?.image_url,
              quantity: qty,
            });
          });
        } else {
          soldItems.push({
            id: q.id,
            name: q.itemsSummary,
            price: q.final_price,
            customer_whatsapp: q.customer_whatsapp,
            staffName: q.staffName,
            sold_at: q.created_at,
            quantity: q.itemsCount || 1,
          });
        }
      });

      // Direct calculations for the selected period (today, week, month, year)
      const rev = closedQuotes.reduce((acc, q) => acc + q.final_price, 0);
      const quotesGen = filtered.length;
      const distinctCustomers = new Set(filtered.map((q) => q.customer_whatsapp)).size;
      const pendingTotal = pendingList.reduce((acc, q) => acc + q.final_price, 0);
      const piecesCount = soldItems.reduce((acc, it) => acc + (it.quantity || 1), 0);

      return {
        revenue: rev,
        soldProducts: soldItems,
        piecesSoldCount: piecesCount,
        customersVisited: distinctCustomers,
        quotesGenerated: quotesGen,
        pendingAmount: pendingTotal,
        pendingQuotes: pendingList,
        allPeriodQuotes: filtered,
      };
    }, [quotes, timeFilter]);

  // Handle smooth scroll to quotes table
  const handleScrollToQuotesTable = () => {
    const el = document.getElementById('quotes-table-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const timeFilterLabels: Record<TimeFilter, string> = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-bold block mb-1">
            Alishan Furnitures
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Showroom sales revenue, customer visits, and pending quotations.
          </p>
        </div>

        {/* Time Filter Segmented Tabs, Download PDF Button & Live Clock */}
        <div className="flex flex-col sm:items-end gap-2.5">
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs shadow-red-600/25 active:scale-95 shrink-0"
              title="Download Custom Date Range PDF Report"
            >
              <FileDown className="w-3.5 h-3.5 text-white" />
              <span>Download PDF</span>
            </button>
            <LiveClock variant="button" showSeconds={false} className="self-start sm:self-auto" />
          </div>
          <div className="w-full sm:w-auto grid grid-cols-4 sm:flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/90 shadow-2xs max-w-full">
          {(['today', 'week', 'month', 'year'] as TimeFilter[]).map((tab) => {
            const isActive = timeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setTimeFilter(tab)}
                className={`py-2 px-1.5 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center flex items-center justify-center active:scale-95 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab === 'today' ? (
                  <span>Today</span>
                ) : (
                  <span>
                    <span className="hidden sm:inline">This </span>
                    {tab === 'week' ? 'Week' : tab === 'month' ? 'Month' : 'Year'}
                  </span>
                )}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {/* 4 Interactive KPI Cards - Mobile-First 2 Cards Per Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
        {/* Card 1: Revenue (Interactive: Tapping opens which products got sold) */}
        <div
          onClick={() => setIsSoldModalOpen(true)}
          className="group relative bg-white border border-slate-100 hover:border-emerald-300 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          title="Tap to see which products got sold"
        >
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5 shrink-0">
                <PackageCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Sold</span>
              </span>
            </div>

            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">
              {timeFilterLabels[timeFilter]}&apos;s Revenue
            </span>
            <p className="text-lg sm:text-2xl lg:text-3xl font-display font-extrabold text-slate-900 tracking-tight truncate">
              {formatINR(revenue)}
            </p>
          </div>

          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-emerald-700 font-bold group-hover:text-emerald-800">
            <span className="truncate">View Sold ({timeFilterLabels[timeFilter]})</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </div>

        {/* Card 2: Customers Visited */}
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold text-sky-700 bg-sky-50 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-sky-200 shrink-0">
                Walk-ins
              </span>
            </div>

            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">
              Customers Visited
            </span>
            <p className="text-lg sm:text-2xl lg:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              {customersVisited}
            </p>
          </div>

          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 text-[10px] sm:text-xs text-slate-400 font-medium truncate">
            Walk-ins ({timeFilterLabels[timeFilter].toLowerCase()})
          </div>
        </div>

        {/* Card 3: Quotes Generated (Interactive: Tapping directs to Quotes Table) */}
        <div
          onClick={handleScrollToQuotesTable}
          className="group relative bg-white border border-slate-100 hover:border-indigo-300 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          title="Tap to jump to quotes table"
        >
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-0.5 shrink-0">
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Active
              </span>
            </div>

            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">
              Quotes Generated
            </span>
            <p className="text-lg sm:text-2xl lg:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              {quotesGenerated}
            </p>
          </div>

          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-indigo-600 font-bold group-hover:text-indigo-800">
            <span className="truncate">View Quotes ({timeFilterLabels[timeFilter].toLowerCase()})</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </div>

        {/* Card 4: Furniture Pieces Sold (Unit Count - Interactive: Tapping opens which products got sold) */}
        <div
          onClick={() => setIsSoldModalOpen(true)}
          className="group relative bg-white border border-slate-100 hover:border-amber-300 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          title="Tap to see which furniture pieces were sold"
        >
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Armchair className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5 shrink-0">
                <PackageCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Units Sold
              </span>
            </div>

            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">
              Pieces Sold
            </span>
            <p className="text-lg sm:text-2xl lg:text-3xl font-display font-extrabold text-slate-900 tracking-tight truncate">
              {piecesSoldCount} <span className="text-xs sm:text-sm font-semibold text-slate-500">{piecesSoldCount === 1 ? 'Piece' : 'Pieces'}</span>
            </p>
          </div>

          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-amber-700 font-bold group-hover:text-amber-800">
            <span className="truncate">View Furnitures ({timeFilterLabels[timeFilter].toLowerCase()})</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </div>
      </div>

      {/* 10:00 PM Daily WhatsApp Summary Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-emerald-500/25">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-display font-bold text-base sm:text-lg text-white">
                Daily 10:00 PM WhatsApp Summary
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                Daily at 10 PM IST
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Every night at 10:00 PM, a daily closing report is generated for Alishan Furnitures including today&apos;s revenue, pending quotes amount, staff breakdown, and priority customer calls for tomorrow.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Daily10pmReportModal
            totalPendingAmount={pendingAmount}
            totalPendingCount={pendingQuotes.length}
            todayClosedAmount={revenue}
          />
        </div>
      </div>

      {/* Quotes Table Section */}
      <div id="quotes-table-section" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
              Customer Quotes ({allPeriodQuotes.length})
            </h2>
            <p className="text-xs text-slate-500">
              Quotes created during this period with live status tracking and salesperson follow-up assignment.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Tap status to update
          </span>
        </div>

        <PendingQuotesTable initialQuotes={allPeriodQuotes} staffList={staffList} />
      </div>

      {/* Modal: Which Products Got Sold (Opens when Revenue Card is tapped) */}
      {isSoldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <Armchair className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                    Furniture Pieces Sold ({timeFilterLabels[timeFilter]})
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    <strong className="text-amber-700 font-bold">{piecesSoldCount} {piecesSoldCount === 1 ? 'Piece' : 'Pieces'}</strong> • Revenue: <strong className="text-emerald-700 font-bold">{formatINR(revenue)}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSoldModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sold Products List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
              {soldProducts.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-700">No furniture pieces sold in this period yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    When quotes are marked as sold or direct walk-ins occur, furnitures will appear here.
                  </p>
                </div>
              ) : (
                soldProducts.map((item, idx) => {
                  const soldDate = new Date(item.sold_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.imageUrl ? (
                          <div className="relative w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                            ✓
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-sm text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              +91 {item.customer_whatsapp}
                            </span>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">By {item.staffName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{soldDate}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-display font-extrabold text-sm sm:text-base text-emerald-700 block">
                          {formatINR(item.price)}
                        </span>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          {item.quantity && item.quantity > 1 && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              x{item.quantity} units
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Sold
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsSoldModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Range Export PDF Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        quotes={quotes}
        staffList={staffList}
      />
    </div>
  );
}
