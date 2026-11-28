'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { FollowUpLead, StaffSession } from '@/lib/types/database';
import { formatINR, isLeadActiveForMorningShift } from '@/lib/utils';
import { Phone, MessageSquare, CheckCircle2, Check, Search, ShoppingBag } from 'lucide-react';
import { markFollowUpContactedAction, markQuoteSoldAction } from '@/app/(sales)/sales/actions';

interface SalesmanFollowupsViewProps {
  staff: StaffSession;
  initialLeads: FollowUpLead[];
  onDealClosed?: (affectedProducts?: { id: string; name: string; remainingStock: number; isSoldOut: boolean }[]) => void;
}

export function SalesmanFollowupsView({
  staff,
  initialLeads,
  onDealClosed,
}: SalesmanFollowupsViewProps) {
  // Only leads active for the current morning shift (deals closed prior to 6:00 AM automatically clear)
  const [leads, setLeads] = useState<FollowUpLead[]>(() =>
    initialLeads.filter((l) => isLeadActiveForMorningShift(l))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [closingLeadId, setClosingLeadId] = useState<string | null>(null);
  const [confirmLead, setConfirmLead] = useState<FollowUpLead | null>(null);
  const [isPending, startTransition] = useTransition();

  // Keep leads in sync if parent initialLeads updates (e.g., staff switch or new quotes created)
  useEffect(() => {
    setLeads(initialLeads.filter((l) => isLeadActiveForMorningShift(l)));
  }, [initialLeads]);

  const handleExecuteCloseDeal = (lead: FollowUpLead) => {
    setClosingLeadId(lead.id);
    setConfirmLead(null);
    startTransition(async () => {
      const res = await markQuoteSoldAction(lead.quoteId, lead.id);
      setClosingLeadId(null);
      if (res.success) {
        const closedTimestamp = new Date().toISOString();
        setLeads((prev) =>
          prev.map((l) =>
            l.id === lead.id ? { ...l, status: 'deal_closed', lastUpdated: closedTimestamp } : l
          )
        );
        onDealClosed?.(res.affectedProducts);
      } else {
        alert(res.error || 'Failed to close deal.');
      }
    });
  };

  const handleDismissClosedLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  const handleToggleCalled = (leadId: string) => {
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const nextStatus = l.status === 'called_interested' ? 'pending' : 'called_interested';
        return { ...l, status: nextStatus };
      })
    );

    startTransition(async () => {
      await markFollowUpContactedAction(leadId);
    });
  };

  // Only count actionable leads in queue (exclude closed deals from pending call queues)
  const pendingCount = leads.filter((l) => l.status === 'pending').length;
  const calledCount = leads.filter((l) => l.status === 'called_interested').length;
  const closedTodayCount = leads.filter((l) => l.status === 'deal_closed').length;

  const filteredLeads = leads.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.customerName.toLowerCase().includes(q) ||
      l.customerWhatsapp.includes(q) ||
      l.itemsSummary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
            Morning Follow-Up Calls
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Customers to call today for quotes (clears daily at 6:00 AM):
          </p>
        </div>

        {leads.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              ⏳ {pendingCount} To Call
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ✓ {calledCount} Called
            </span>
            {closedTodayCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                🎉 {closedTodayCount} Won Today
              </span>
            )}
          </div>
        )}
      </div>

      {/* Fast Lead Search Bar */}
      {leads.length > 0 && (
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by customer name, phone, or furniture..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 shadow-xs"
          />
        </div>
      )}

      {leads.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          No pending calls right now.
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          No follow-ups match "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const isCalled = lead.status === 'called_interested';
            const isClosed = lead.status === 'deal_closed';
            const whatsappMsg = encodeURIComponent(
              `Hello ${lead.customerName}! This is ${staff.name.split(' ')[0]} from Alishan Furnitures.\n\nRegarding your quote for ${lead.itemsSummary} (${formatINR(lead.quotedAmount)}).\n\nPlease let us know if you need any help.\n\nThank you!`
            );

            return (
              <div
                key={lead.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isClosed
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : isCalled
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Customer & Item details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                      {lead.customerName}
                    </h3>
                    <span className="font-mono text-xs sm:text-sm text-slate-600 font-semibold">
                      +91 {lead.customerWhatsapp}
                    </span>
                    {isClosed ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 text-[10px] font-extrabold">
                        Won & Closed
                      </span>
                    ) : isCalled ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Called
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium truncate">
                    {lead.itemsSummary}
                  </p>

                  {lead.orderNotes && (
                    <p className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 font-medium italic inline-block mt-0.5">
                      Notes: &ldquo;{lead.orderNotes}&rdquo;
                    </p>
                  )}

                  <p className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                    {formatINR(lead.quotedAmount)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-64">
                  {lead.status === 'deal_closed' ? (
                    <div className="space-y-1.5 w-full">
                      <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-between shadow-2xs select-none">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="truncate">Deal Won & Closed!</span>
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md font-semibold shrink-0 ml-1">
                          Clears at 6 AM
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDismissClosedLead(lead.id)}
                        className="w-full text-center py-1 text-[11px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-dashed border-slate-200 transition"
                        title="Dismiss card now from morning view"
                      >
                        Clear card from screen
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Row 1: Direct Contact Buttons */}
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <a
                          href={`tel:+91${lead.customerWhatsapp}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm active:scale-95 transition shadow-2xs whitespace-nowrap"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/91${lead.customerWhatsapp}?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm active:scale-95 transition shadow-2xs whitespace-nowrap"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {/* Row 2: Mark as Called */}
                      <button
                        type="button"
                        onClick={() => handleToggleCalled(lead.id)}
                        className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition active:scale-95 whitespace-nowrap ${
                          isCalled
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                        }`}
                        title={isCalled ? 'Click to unmark' : 'Mark customer as called'}
                      >
                        {isCalled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="whitespace-nowrap">Called</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="whitespace-nowrap">Mark Called</span>
                          </>
                        )}
                      </button>

                      {/* Row 3: Mark Deal Closed (Customer Bought) */}
                      <button
                        type="button"
                        disabled={closingLeadId === lead.id || isPending}
                        onClick={() => setConfirmLead(lead)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition disabled:opacity-50 whitespace-nowrap"
                        title="Customer bought items on call - deduct showroom inventory"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                        <span>{closingLeadId === lead.id ? 'Updating Stock...' : 'Mark Deal Closed (Bought)'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRM DEAL CLOSED MODAL */}
      {confirmLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 stroke-[2]" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-slate-900 mb-2">
              Confirm Deal Closure
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Did <strong className="text-slate-900 font-bold">{confirmLead.customerName}</strong> confirm the purchase for{' '}
              <strong className="text-emerald-700 font-bold">{formatINR(confirmLead.quotedAmount)}</strong>?
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-6 text-left space-y-1">
              <div><strong>Items:</strong> {confirmLead.itemsSummary}</div>
              <div className="text-[11px] text-slate-500">
                Showroom inventory for these quoted items will be deducted immediately.
              </div>
            </div>

            <div className="flex gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmLead(null)}
                className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition whitespace-nowrap text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleExecuteCloseDeal(confirmLead)}
                className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Yes, Deal Closed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
