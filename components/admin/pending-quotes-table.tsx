'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { updateQuoteStatus, assignQuoteToStaffAction } from '@/app/(admin)/admin/actions';
import { QuoteStatus } from '@/lib/types/database';
import { StaffMember } from '@/lib/store/showroom-store';
import {
  MessageSquare,
  ExternalLink,
  ArrowUpRight,
  Check,
  Calendar,
  User,
  CheckCircle2,
} from 'lucide-react';

export interface PendingQuoteRow {
  id: string;
  created_at: string;
  customer_name?: string;
  customer_whatsapp: string;
  subtotal: number;
  final_price: number;
  status: QuoteStatus;
  staffName: string;
  itemsSummary: string;
  itemsCount: number;
  orderNotes?: string;
  advanceDeposit?: number;
}

interface PendingQuotesTableProps {
  initialQuotes: PendingQuoteRow[];
  staffList?: StaffMember[];
}

const DEFAULT_STAFF_OPTIONS: StaffMember[] = [
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    name: 'Arjun Verma',
    pin: '1111',
    role: 'sales',
    is_active: true,
    created_at: '',
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    name: 'Sneha Kapoor',
    pin: '2222',
    role: 'sales',
    is_active: true,
    created_at: '',
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Vikram Mehta (Owner)',
    pin: '1234',
    role: 'admin',
    is_active: true,
    created_at: '',
  },
];

export function PendingQuotesTable({
  initialQuotes,
  staffList = [],
}: PendingQuotesTableProps) {
  const [quotes, setQuotes] = useState<PendingQuoteRow[]>(initialQuotes);
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [assignToast, setAssignToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuotes(initialQuotes);
  }, [initialQuotes]);

  const staffOptions = staffList.length > 0 ? staffList : DEFAULT_STAFF_OPTIONS;

  const pendingCount = quotes.filter((q) => q.status === 'pending').length;
  const contactedCount = quotes.filter((q) => q.status === 'contacted').length;
  const closedCount = quotes.filter((q) => q.status === 'closed').length;
  const noDealCount = quotes.filter((q) => q.status === 'no_deal').length;

  const displayedQuotes =
    statusFilter === 'all' ? quotes : quotes.filter((q) => q.status === statusFilter);

  // 1. Change Quote Status
  const handleStatusChange = (quoteId: string, newStatus: QuoteStatus) => {
    setUpdatingId(quoteId);

    // Optimistic update in place
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q))
    );

    startTransition(async () => {
      const res = await updateQuoteStatus(quoteId, newStatus);
      if (!res.success) {
        alert(res.error || 'Failed to update quote status');
      }
      setUpdatingId(null);
    });
  };

  // 2. Assign Salesperson for Customer Follow-Up
  const handleAssignStaff = (quote: PendingQuoteRow, selectedStaffName: string) => {
    const selectedStaff = staffOptions.find((s) => s.name === selectedStaffName);
    if (!selectedStaff) return;

    setUpdatingId(quote.id);

    // Optimistically update
    setQuotes((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, staffName: selectedStaff.name } : q))
    );

    startTransition(async () => {
      const res = await assignQuoteToStaffAction(
        quote.id,
        selectedStaff.id,
        selectedStaff.name,
        quote.customer_whatsapp,
        quote.itemsSummary,
        quote.final_price
      );

      if (res.success) {
        setAssignToast(
          `Customer +91 ${quote.customer_whatsapp} assigned to ${selectedStaff.name}!`
        );
        setTimeout(() => setAssignToast(null), 3000);
      } else {
        alert(res.error || 'Failed to assign salesperson');
      }
      setUpdatingId(null);
    });
  };

  if (quotes.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-10 sm:p-16 text-center shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <Check className="w-7 h-7 stroke-[2]" />
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
          No Pending Quotes
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto font-normal">
          All customer quotes are currently followed up or closed. New quotes will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Assignment Feedback Toast */}
      {assignToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{assignToast}</span>
        </div>
      )}

      {/* 1-Tap Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Quotes', count: quotes.length },
          { id: 'pending', label: '⏳ Pending', count: pendingCount },
          { id: 'contacted', label: '📞 Called', count: contactedCount },
          { id: 'closed', label: '✅ Sold', count: closedCount },
          { id: 'no_deal', label: '❌ No deal', count: noDealCount },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {displayedQuotes.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center">
          <p className="text-xs font-medium text-slate-500">
            No quotes match this status in the selected timeframe.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Mobile Cards Layout (Under md: screen) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
            {displayedQuotes.map((q) => {
          const formattedDate = new Date(q.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
          const isThisUpdating = updatingId === q.id && isPending;

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  {q.customer_name && (
                    <span className="text-xs font-bold text-slate-900 block truncate mb-0.5">
                      👤 {q.customer_name}
                    </span>
                  )}
                  <span className="text-lg font-display font-extrabold text-slate-900 block leading-tight">
                    {formatINR(q.final_price)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {q.itemsCount} {q.itemsCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items summary with link */}
              <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-700 font-medium truncate">
                    {q.itemsSummary}
                  </span>
                  <Link
                    href={`/quote/${q.id}`}
                    target="_blank"
                    className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded-lg shrink-0 transition"
                    title="View Quote"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                {q.orderNotes && (
                  <span className="text-[10px] text-indigo-700 font-medium italic bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/50">
                    Customization: &ldquo;{q.orderNotes}&rdquo;
                  </span>
                )}
              </div>

              {/* Assign Follow-Up Salesperson Dropdown on Mobile */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Assign:
                </span>
                <select
                  disabled={isThisUpdating}
                  value={q.staffName}
                  onChange={(e) => handleAssignStaff(q, e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  title="Assign which salesperson follows up"
                >
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons: WhatsApp & Status Selector */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/91${q.customer_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition shadow-2xs shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+91 {q.customer_whatsapp.slice(-4)}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>

                <select
                  disabled={isThisUpdating}
                  value={q.status}
                  onChange={(e) => handleStatusChange(q.id, e.target.value as QuoteStatus)}
                  className={`text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer border shadow-2xs ${
                    q.status === 'pending'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : q.status === 'contacted'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : q.status === 'closed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="contacted">📞 Called</option>
                  <option value="closed">✅ Sold</option>
                  <option value="no_deal">❌ No deal</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Table Layout (md: and up) */}
      <div className="hidden md:block bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-900 table-auto">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] lg:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-3 lg:px-4">Date &amp; Time</th>
                <th className="py-3.5 px-3 lg:px-4">Customer WhatsApp</th>
                <th className="py-3.5 px-3 lg:px-4">Items</th>
                <th className="py-3.5 px-3 lg:px-4 text-right">Quote Price</th>
                <th className="py-3.5 px-3 lg:px-4 text-center">Assigned Salesperson</th>
                <th className="py-3.5 px-3 lg:px-4 text-center pr-4 lg:pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedQuotes.map((q) => {
                const formattedDate = new Date(q.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isThisUpdating = updatingId === q.id && isPending;

                return (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 px-3 lg:px-4 text-xs text-slate-500 whitespace-nowrap font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 lg:px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5 items-start">
                        {q.customer_name && (
                          <span className="font-bold text-xs text-slate-900 leading-tight">
                            {q.customer_name}
                          </span>
                        )}
                        <a
                          href={`https://wa.me/91${q.customer_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200/80 transition shadow-2xs"
                          title="Open WhatsApp chat with client"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>+91 {q.customer_whatsapp}</span>
                          <ArrowUpRight className="w-2.5 h-2.5 opacity-60 shrink-0" />
                        </a>
                      </div>
                    </td>

                    <td className="py-3 px-3 lg:px-4">
                      <div className="flex flex-col gap-0.5 max-w-[170px] lg:max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs text-slate-700 font-medium" title={q.itemsSummary}>
                            {q.itemsSummary}
                          </span>
                          <Link
                            href={`/quote/${q.id}`}
                            target="_blank"
                            className="text-indigo-600 hover:text-indigo-800 transition p-0.5 hover:bg-indigo-50 rounded shrink-0"
                            title="View digital customer quote"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        {q.orderNotes && (
                          <span className="text-[10px] text-indigo-700 font-medium italic bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/50 truncate block">
                            Customization: &ldquo;{q.orderNotes}&rdquo;
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 lg:px-4 text-right font-display text-sm lg:text-base font-extrabold text-slate-900 whitespace-nowrap">
                      {formatINR(Number(q.final_price))}
                    </td>

                    {/* Assigned Salesperson Dropdown (Easy 1-Tap UI for Owner) */}
                    <td className="py-3 px-3 lg:px-4 text-center whitespace-nowrap">
                      <select
                        disabled={isThisUpdating}
                        value={q.staffName}
                        onChange={(e) => handleAssignStaff(q, e.target.value)}
                        className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition max-w-[150px] truncate"
                        title="Change which salesperson follows up with this customer"
                      >
                        {staffOptions.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-3 lg:px-4 text-center whitespace-nowrap pr-4 lg:pr-6">
                      <select
                        disabled={isThisUpdating}
                        value={q.status}
                        onChange={(e) => handleStatusChange(q.id, e.target.value as QuoteStatus)}
                        className={`text-xs font-semibold rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer border shadow-2xs transition ${
                          q.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : q.status === 'contacted'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : q.status === 'closed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="contacted">📞 Called</option>
                        <option value="closed">✅ Sold</option>
                        <option value="no_deal">❌ No deal</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
