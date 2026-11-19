'use client';

import React, { useState, useTransition } from 'react';
import { FollowUpLead, StaffSession } from '@/lib/types/database';
import { formatINR } from '@/lib/utils';
import { Phone, MessageSquare, CheckCircle2, Check, Search } from 'lucide-react';
import { markFollowUpContactedAction } from '@/app/(sales)/sales/actions';

interface SalesmanFollowupsViewProps {
  staff: StaffSession;
  initialLeads: FollowUpLead[];
}

export function SalesmanFollowupsView({
  staff,
  initialLeads,
}: SalesmanFollowupsViewProps) {
  const [leads, setLeads] = useState<FollowUpLead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

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

  const pendingCount = leads.filter((l) => l.status !== 'called_interested').length;
  const calledCount = leads.length - pendingCount;

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
            Customers to call today for quotes:
          </p>
        </div>

        {leads.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              ⏳ {pendingCount} To Call
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ✓ {calledCount} Called
            </span>
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
            const whatsappMsg = encodeURIComponent(
              `Hello ${lead.customerName}! This is ${staff.name.split(' ')[0]} from Alishan Furnitures.\n\nRegarding your quote for ${lead.itemsSummary} (${formatINR(lead.quotedAmount)}).\n\nPlease let us know if you need any help.\n\nThank you!`
            );

            return (
              <div
                key={lead.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isCalled ? 'border-emerald-200/80 bg-emerald-50/20' : 'border-slate-200'
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
                    {isCalled && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Called
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium truncate">
                    {lead.itemsSummary}
                  </p>

                  <p className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                    {formatINR(lead.quotedAmount)}
                  </p>
                </div>

                {/* Actions: Row 1 = Call & WhatsApp, Row 2 = Mark Called */}
                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-64">
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

                  {/* Row 2: Mark as Called (Below Call & WhatsApp, clean 1-line layout) */}
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
