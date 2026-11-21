import React from 'react';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { PrintButton } from './print-button';
import { Sparkles, UserCheck, Clock, MessageCircle, Phone, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface PopulatedQuoteItem {
  id: string;
  price_at_time: number;
  quantity?: number;
  product: {
    id: string;
    name: string;
    material: string;
    dimensions: string;
    more_info?: string;
    image_url: string;
  };
}

export interface PopulatedQuote {
  id: string;
  customer_name?: string;
  customer_whatsapp: string;
  order_notes?: string;
  subtotal: number;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  final_price: number;
  status: 'pending' | 'contacted' | 'closed' | 'no_deal';
  created_at: string;
  staff: {
    id: string;
    name: string;
    role: string;
  } | null;
  items: PopulatedQuoteItem[];
}

interface QuoteDocumentProps {
  quote: PopulatedQuote;
}

export function QuoteDocument({ quote }: QuoteDocumentProps) {
  const formattedDate = new Date(quote.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const discountSavings = Math.max(0, quote.subtotal - quote.final_price);

  const discountLabel =
    quote.items.length === 1 ? 'Special Discount' : 'Package Discount';

  const shortRef = quote.id.split('-')[0].toUpperCase();

  const createdAtDate = new Date(quote.created_at);
  const validUntilDate = new Date(createdAtDate.getTime() + 24 * 60 * 60 * 1000);
  const validUntilFormatted = validUntilDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });

  const isClosed = quote.status === 'closed';
  const isNoDeal = quote.status === 'no_deal';

  const itemNames = quote.items.map((i) => i.product.name).join(', ');

  let whatsappBtnLabel = 'Confirm Booking on WhatsApp';
  let whatsappMsg =
    `Hello Alishan Furnitures! I would like to confirm my booking for Quote #${shortRef}.\n` +
    `Items: ${itemNames}\n` +
    `Final Total: ${formatINR(quote.final_price)}\n\n` +
    `Please share the payment details and delivery schedule.`;

  if (isClosed) {
    whatsappBtnLabel = 'Track Order / Delivery on WhatsApp';
    whatsappMsg = `Hello Alishan Furnitures! I am following up on my confirmed order for Quote #${shortRef} (${itemNames}). Please share the dispatch schedule and delivery updates.`;
  } else if (isNoDeal) {
    whatsappBtnLabel = 'Contact Showroom on WhatsApp';
    whatsappMsg = `Hello Alishan Furnitures! Regarding Quote #${shortRef}, I would like to ask a question or explore alternative pieces.`;
  }

  const whatsappConfirmUrl = `https://wa.me/919876543210?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] overflow-hidden text-slate-900 my-2 sm:my-6 md:my-10 print:border-none print:shadow-none print:my-0 print:p-0 relative">
      {/* Decorative Top Accent Edge */}
      <div
        className={`h-2 w-full no-print ${
          isClosed
            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
            : isNoDeal
            ? 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600'
            : 'bg-gradient-to-r from-indigo-600 via-emerald-500 to-amber-500'
        }`}
      />

      {/* Top Header - Unified structure for both mobile and desktop */}
      <header className="p-5 sm:p-8 md:p-12 border-b border-slate-100 flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-display text-base sm:text-xl font-bold shadow-md shadow-indigo-600/25 shrink-0">
            AF
          </span>
          <div className="min-w-0">
            <span className="font-display text-base sm:text-2xl tracking-wide font-extrabold text-slate-900 uppercase block truncate">
              Alishan Furnitures
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-indigo-600 font-bold block">
              Furniture Showroom
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          {isClosed ? (
            <span className="inline-block px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1 border border-emerald-300">
              ✅ Order Confirmed
            </span>
          ) : isNoDeal ? (
            <span className="inline-block px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1 border border-slate-300">
              ❌ Quote Closed
            </span>
          ) : (
            <span className="inline-block px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1 border border-indigo-200">
              Price Quote
            </span>
          )}
          <p className="text-[11px] sm:text-xs font-mono text-slate-600 font-bold">Quote #{shortRef}</p>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{formattedDate}</p>
        </div>
      </header>

      {/* Sales Person Info & Customer Greeting */}
      <div className="px-5 sm:px-8 md:px-12 py-3 sm:py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-xs text-slate-500 font-medium">Attended by:</span>
          <span className="text-xs font-display font-bold text-slate-900">
            {quote.staff?.name || 'Showroom Staff'}
          </span>
        </div>
        {quote.customer_name && (
          <div className="text-xs text-slate-700 font-medium">
            Prepared for: <span className="font-bold text-slate-900">{quote.customer_name}</span>
          </div>
        )}
        <div className="text-xs font-mono font-medium text-slate-400">
          Ref: #{shortRef}
        </div>
      </div>

      {/* Body: Item List - Unified row layout with thumbnail + details on left and price on right */}
      <section className="p-5 sm:p-8 md:p-12">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 sm:mb-6">
          Selected Items ({quote.items.length})
        </h2>

        <div className="divide-y divide-slate-100">
          {quote.items.map((item) => {
            const qty = item.quantity && item.quantity > 1 ? item.quantity : 1;
            const lineTotal = Number(item.price_at_time) * qty;
            return (
              <div
                key={item.id}
                className="py-4 sm:py-6 first:pt-0 last:pb-0 flex items-center justify-between gap-3 sm:gap-5 break-inside-avoid"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <h3 className="font-display text-sm sm:text-lg md:text-xl font-bold text-slate-900 leading-snug truncate">
                      {item.product.name}{' '}
                      {qty > 1 && (
                        <span className="text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 ml-1 inline-block">
                          × {qty}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      Material: {item.product.material}
                    </p>
                    <p className="text-[11px] text-indigo-600 font-mono font-semibold truncate">
                      Size: {item.product.dimensions}
                    </p>
                    {item.product.more_info && (
                      <p className="text-[11px] text-slate-600 font-medium truncate">
                        Spec: {item.product.more_info}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price - Line Total */}
                <div className="text-right shrink-0">
                  <span className="font-display text-base sm:text-xl font-extrabold text-slate-900">
                    {formatINR(lineTotal)}
                  </span>
                  {qty > 1 && (
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                      {formatINR(Number(item.price_at_time))} each
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Customization / Order Notes */}
        {quote.order_notes && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
              Customization & Special Instructions
            </span>
            <p className="text-xs sm:text-sm text-slate-800 font-medium italic">
              &ldquo;{quote.order_notes}&rdquo;
            </p>
          </div>
        )}

        {/* Financial Summary */}
        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-100 space-y-3.5">
          <div className="flex items-center justify-between text-sm text-slate-600 font-medium">
            <span>Items Total</span>
            <span className="font-display font-bold text-slate-900 text-base">
              {formatINR(quote.subtotal)}
            </span>
          </div>

          {discountSavings > 0 && (
            <div className="flex items-center justify-between text-sm text-emerald-800 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {discountLabel}
              </span>
              <span className="font-display font-extrabold text-emerald-700">-{formatINR(discountSavings)}</span>
            </div>
          )}

          {/* Final Total */}
          <div className="pt-4 sm:pt-5 border-t border-slate-200 flex items-baseline justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-indigo-600 font-bold block">
                Final Total
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400">
                Delivery and all taxes included
              </span>
            </div>
            <span className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-slate-950 tracking-tight">
              {formatINR(quote.final_price)}
            </span>
          </div>

          {/* Status-Aware Notice Banner */}
          {isClosed ? (
            <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-left flex items-start gap-3 sm:gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-display font-bold text-emerald-950 text-xs sm:text-sm md:text-base">
                    Order Confirmed &amp; Booked!
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/90 text-emerald-900 text-[10px] sm:text-[11px] font-bold font-mono">
                    ✅ Active Order
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-900 leading-relaxed font-medium">
                  Thank you for choosing Alishan Furnitures. Your order is confirmed and our showroom team is preparing your pieces for dispatch and white-glove installation.
                </p>
              </div>
            </div>
          ) : isNoDeal ? (
            <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-slate-100 border-2 border-slate-300 text-left flex items-start gap-3 sm:gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <span className="font-display font-bold text-slate-800 text-xs sm:text-sm md:text-base block">
                  Quote Concluded
                </span>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-medium">
                  This quotation has concluded. Please contact our showroom if you would like to explore alternative furniture collections or custom fabrics.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-left flex items-start gap-3 sm:gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-display font-bold text-amber-950 text-xs sm:text-sm md:text-base">
                    Notice: Quote Valid for 24 Hours Only
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200/90 text-amber-900 text-[10px] sm:text-[11px] font-bold font-mono">
                    Valid till: {validUntilFormatted}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed font-medium">
                  This quote and price are valid for 24 hours only. These items are reserved for you during this time. No other quote will be generated for these products until 24 hours have passed.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer & Actions */}
      <footer className="p-6 sm:p-8 md:p-12 bg-slate-50 border-t border-slate-100 flex flex-col items-center text-center space-y-5 sm:space-y-6">
        <div className="space-y-1.5 max-w-md">
          <p className="text-sm font-display font-bold text-slate-900">
            Thank you for visiting Alishan Furnitures!
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            This quote was prepared for{' '}
            {quote.customer_name ? (
              <>
                <span className="font-bold text-slate-800">{quote.customer_name}</span> (WhatsApp ending in{' '}
                <span className="font-mono text-slate-800 font-bold">
                  ••••{quote.customer_whatsapp.slice(-4)}
                </span>
                )
              </>
            ) : (
              <>
                WhatsApp ending in{' '}
                <span className="font-mono text-slate-800 font-bold">
                  ••••{quote.customer_whatsapp.slice(-4)}
                </span>
              </>
            )}
            . Please contact us if you need any assistance.
          </p>
        </div>

        {/* Customer Quick Actions - Instant Booking via WhatsApp & Phone Call */}
        <div className="w-full max-w-md space-y-2.5 no-print">
          <a
            href={whatsappConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-98 transition"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>{whatsappBtnLabel}</span>
          </a>

          <a
            href="tel:+919876543210"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm shadow-xs active:scale-98 transition"
          >
            <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Call Showroom (+91 9876543210)</span>
          </a>
        </div>

        {/* Reassurance Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-semibold text-slate-600 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
            Free Delivery & Assembly
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            5-Year Warranty Guarantee
          </span>
        </div>

        {/* PDF Download Trigger */}
        <div className="w-full sm:w-auto pt-1 no-print">
          <PrintButton label="Save as PDF" className="w-full sm:w-auto" />
        </div>
      </footer>
    </div>
  );
}
