'use client';

import React, { useState, useMemo, useTransition } from 'react';
import Image from 'next/image';
import { Product, StaffSession, DiscountType } from '@/lib/types/database';
import { formatINR } from '@/lib/utils';
import { createQuote, markQuoteSoldAction } from '@/app/(sales)/sales/actions';
import {
  Trash2,
  Send,
  Phone,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  X,
  FileText,
  Download,
} from 'lucide-react';
import { generateQuotePdfBlob } from '@/lib/pdf/quote-pdf';

interface QuoteCartProps {
  selectedProducts: Product[];
  quantities?: Record<string, number>;
  onUpdateQuantity?: (productId: string, delta: number) => void;
  staff: StaffSession;
  onRemoveProduct: (productId: string) => void;
  onClearCart: () => void;
  onCloseMobile?: () => void;
  onDealClosed?: (affectedProducts?: { id: string; name: string; remainingStock: number; isSoldOut: boolean }[]) => void;
}

export function QuoteCart({
  selectedProducts,
  quantities,
  onUpdateQuantity,
  staff,
  onRemoveProduct,
  onClearCart,
  onCloseMobile,
  onDealClosed,
}: QuoteCartProps) {
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValueInput, setDiscountValueInput] = useState<string>('0');
  const [customerName, setCustomerName] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [advanceDepositInput, setAdvanceDepositInput] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isDealClosed, setIsDealClosed] = useState<boolean>(false);
  const [isMarkingSold, setIsMarkingSold] = useState<boolean>(false);
  const [generatedQuote, setGeneratedQuote] = useState<{
    id: string;
    url: string;
    whatsappUrl: string;
    pdfBlobUrl: string;
    pdfFileName: string;
    pdfFile: File;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const getItemQty = (id: string) => {
    return (quantities && quantities[id]) || 1;
  };

  // 1. Live Subtotal with Quantities
  const subtotal = useMemo(() => {
    return selectedProducts.reduce((sum, item) => {
      const q = (quantities && quantities[item.id]) || 1;
      return sum + Number(item.price) * q;
    }, 0);
  }, [selectedProducts, quantities]);

  const totalItemsCount = useMemo(() => {
    return selectedProducts.reduce((sum, item) => {
      const q = (quantities && quantities[item.id]) || 1;
      return sum + q;
    }, 0);
  }, [selectedProducts, quantities]);

  // 2. Dynamic Discount Math
  const numericalDiscount = parseFloat(discountValueInput) || 0;
  const calculatedDiscountAmount = useMemo(() => {
    if (numericalDiscount <= 0 || subtotal <= 0) return 0;
    if (discountType === 'percentage') {
      const clampedPct = Math.min(100, Math.max(0, numericalDiscount));
      return (subtotal * clampedPct) / 100;
    } else {
      return Math.min(subtotal, Math.max(0, numericalDiscount));
    }
  }, [subtotal, discountType, numericalDiscount]);

  // 3. Final Price & Advance Math
  const finalPrice = Math.max(0, subtotal - calculatedDiscountAmount);
  const numericalAdvance = parseFloat(advanceDepositInput) || 0;
  const advanceDeposit = Math.min(finalPrice, Math.max(0, numericalAdvance));
  const balanceDue = Math.max(0, finalPrice - advanceDeposit);

  // Discount label: clean standard "Discount"
  const discountLabel = 'Discount';

  // 4. WhatsApp Number Validation (Strict Indian Mobile Regex: handles 10 digits, +91, and leading 0)
  let cleanWhatsappNumber = whatsappNumber.replace(/\D/g, '');
  if (cleanWhatsappNumber.startsWith('91') && cleanWhatsappNumber.length === 12) {
    cleanWhatsappNumber = cleanWhatsappNumber.slice(2);
  } else if (cleanWhatsappNumber.startsWith('0') && cleanWhatsappNumber.length === 11) {
    cleanWhatsappNumber = cleanWhatsappNumber.slice(1);
  }
  const isValidWhatsapp = /^[6-9]\d{9}$/.test(cleanWhatsappNumber);

  // 5. Submit Handler
  const handleGenerateQuote = () => {
    setFormError(null);

    if (selectedProducts.length === 0) {
      setFormError('Please select at least one furniture piece from the showroom floor.');
      return;
    }

    const trimmedCustomerName = customerName.trim().slice(0, 80);
    if (!trimmedCustomerName) {
      setFormError("Please enter the customer's full name.");
      return;
    }

    if (!isValidWhatsapp) {
      setFormError('Please enter a valid 10-digit Indian WhatsApp mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    startTransition(async () => {
      const trimmedNotes = orderNotes.trim().slice(0, 500);

      const payload = {
        staffId: staff.id,
        customerName: trimmedCustomerName,
        customerWhatsapp: cleanWhatsappNumber,
        orderNotes: trimmedNotes || undefined,
        advanceDeposit: advanceDeposit > 0 ? advanceDeposit : undefined,
        subtotal,
        discountType,
        discountValue: numericalDiscount,
        finalPrice,
        items: selectedProducts.map((p) => ({
          productId: p.id,
          name: p.name,
          priceAtTime: Number(p.price),
          quantity: getItemQty(p.id),
        })),
      };

      const result = await createQuote(payload);

      if (!result.success || !result.quoteId) {
        setFormError(result.error || 'Failed to dispatch digital quote. Please check connection.');
        return;
      }

      const shortRef = result.quoteId.slice(-6).toUpperCase();
      const quoteUrl = `${window.location.origin}/quote/${result.quoteId}`;
      const formattedPrice = formatINR(finalPrice);

      const greeting = trimmedCustomerName ? `Hello ${trimmedCustomerName}!` : 'Hello!';
      const notesLine = trimmedNotes ? `\n\nCustomization / Notes: ${trimmedNotes}` : '';
      const advanceLine = advanceDeposit > 0
        ? `\nAdvance Token Paid: ${formatINR(advanceDeposit)}\nBalance Due on Delivery: ${formatINR(balanceDue)}`
        : '';
      const message = `${greeting} Thank you for visiting Alishan Furnitures today.

Please find attached your official furniture quotation (Quote #${shortRef}) for ${formattedPrice}.${advanceLine}${notesLine}

Note: Prices are valid for 7 days, subject to showroom stock availability.

Thank you,
${staff.name}
Alishan Furnitures`;

      // 1. Generate official branded PDF Blob matching the Quote Document layout
      const pdfBlob = await generateQuotePdfBlob({
        quoteId: result.quoteId,
        shortRef,
        dateFormatted: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        validUntilFormatted: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        staffName: staff.name,
        customerName: trimmedCustomerName,
        customerWhatsapp: cleanWhatsappNumber,
        orderNotes: trimmedNotes || undefined,
        advanceDeposit: advanceDeposit > 0 ? advanceDeposit : undefined,
        items: selectedProducts.map((p) => ({
          name: p.name,
          material: p.material,
          dimensions: p.dimensions,
          more_info: p.more_info,
          price: Number(p.price),
          quantity: getItemQty(p.id),
          image_url: p.image_url,
        })),
        subtotal,
        discountType,
        discountValue: numericalDiscount,
        finalPrice,
      });

      const pdfFileName = `Alishan_Furnitures_Quote_${shortRef}.pdf`;
      const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);

      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/91${cleanWhatsappNumber}?text=${encodedMsg}`;

      setGeneratedQuote({
        id: result.quoteId,
        url: quoteUrl,
        whatsappUrl,
        pdfBlobUrl,
        pdfFileName,
        pdfFile,
        message,
      });

      // 2. Native Web Share with actual PDF file on Mobile/iPad
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [pdfFile] })
      ) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `Alishan Furnitures Quote #${shortRef}`,
            text: message,
          });
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') return;
          console.warn('Native share sheet cancelled/unsupported:', shareErr);
        }
      }

      // 3. Desktop / Fallback: Auto-download the PDF document and open WhatsApp
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfBlobUrl;
      downloadLink.download = pdfFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      window.open(whatsappUrl, '_blank');
    });
  };

  const handleShareAgain = async () => {
    if (!generatedQuote) return;
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [generatedQuote.pdfFile] })
    ) {
      try {
        await navigator.share({
          files: [generatedQuote.pdfFile],
          title: generatedQuote.pdfFileName,
          text: generatedQuote.message,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    window.open(generatedQuote.whatsappUrl, '_blank');
  };

  const handleCopyLink = () => {
    if (!generatedQuote) return;
    navigator.clipboard.writeText(generatedQuote.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkDealClosed = () => {
    if (!generatedQuote?.id || isMarkingSold) return;
    setIsMarkingSold(true);
    startTransition(async () => {
      const res = await markQuoteSoldAction(generatedQuote.id);
      setIsMarkingSold(false);
      if (res.success) {
        setIsDealClosed(true);
        onDealClosed?.(res.affectedProducts);
      } else {
        alert(res.error || 'Failed to update deal status.');
      }
    });
  };

  const handleResetForNewQuote = () => {
    setGeneratedQuote(null);
    setIsDealClosed(false);
    setIsMarkingSold(false);
    setCustomerName('');
    setWhatsappNumber('');
    setOrderNotes('');
    setAdvanceDepositInput('');
    setDiscountValueInput('0');
    setDiscountType('percentage');
    onClearCart();
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl flex flex-col text-slate-900 overflow-hidden w-full max-h-[calc(100vh-6.5rem)]">
      {/* 1. Header (Fixed at top of card) */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/70 text-indigo-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Selected Items
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedProducts.length > 0 && !generatedQuote && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg px-2.5 py-1 transition font-medium"
            >
              Clear all
            </button>
          )}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Generated Success Card */}
      {generatedQuote ? (
        <div className="p-6 flex flex-col items-center text-center animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-700 mb-1">
            Quote PDF Ready
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
            Quote Sent on WhatsApp
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs font-normal">
            Official quote PDF document generated for WhatsApp.
          </p>

          {/* PDF Document File Card */}
          <div className="w-full mt-4 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {generatedQuote.pdfFileName}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Official Branded PDF Document
                </span>
              </div>
            </div>

            <a
              href={generatedQuote.pdfBlobUrl}
              download={generatedQuote.pdfFileName}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition shadow-2xs shrink-0"
              title="Download PDF Document"
            >
              <Download className="w-4 h-4 text-indigo-600" />
            </a>
          </div>

          {/* Post-Quote Customer Decision & Inventory Stock Action */}
          <div className="w-full mt-4 p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Customer Decision / Inventory Status
            </span>
            {isDealClosed ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deal Closed! Inventory stock deducted in showroom store.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isMarkingSold || isPending}
                  onClick={handleMarkDealClosed}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isMarkingSold ? 'Updating Stock...' : 'Mark Deal Closed (Customer Bought)'}</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  Tap if customer pays advance token or purchases now. Otherwise, pieces remain available for other floor customers.
                </p>
              </div>
            )}
          </div>

          <div className="w-full grid grid-cols-1 gap-2.5 sm:gap-3 mt-4">
            <button
              type="button"
              onClick={handleShareAgain}
              className="w-full py-3.5 sm:py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-600/25 active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Share Quote on WhatsApp Again</span>
            </button>

            <button
              type="button"
              onClick={handleResetForNewQuote}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition"
            >
              Make Another Quote
            </button>
          </div>
        </div>
      ) : (
        /* Active Form: Flex Column with scrollable middle and pinned bottom */
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* 2. Middle Scrollable Content (Items + Inputs) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 min-h-0">
            {/* Item List (compact scrollable) */}
            <div className="space-y-2 max-h-[140px] sm:max-h-[180px] overflow-y-auto pr-1">
              {selectedProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="font-display font-semibold text-sm sm:text-base text-slate-600">No items in quote</p>
                  <p className="text-xs mt-1 max-w-xs mx-auto text-slate-400">
                    Click &ldquo;+ Add to Quote&rdquo; on any furniture piece.
                  </p>
                </div>
              ) : (
                selectedProducts.map((item) => {
                  const qty = getItemQty(item.id);
                  const lineTotal = Number(item.price) * qty;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200/80">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-display font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        {item.more_info && (
                          <span className="text-[10px] text-slate-500 font-medium truncate block">
                            {item.more_info}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-indigo-600">
                            {formatINR(lineTotal)}
                          </span>
                          {qty > 1 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              ({formatINR(Number(item.price))} ea)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper [ - 1 + ] */}
                      {onUpdateQuantity && (
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shrink-0 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            disabled={qty <= 1}
                            className="w-5 h-5 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-xs font-bold transition"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold text-slate-900 select-none">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveProduct(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Subtotal */}
            {selectedProducts.length > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <span className="text-slate-500 font-medium">Items Total</span>
                <span className="font-display font-bold text-slate-900 text-sm sm:text-base">
                  {formatINR(subtotal)}
                </span>
              </div>
            )}

            {/* Discount Group */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {discountLabel}
                </span>

                <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => setDiscountType('flat')}
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg transition-all ${
                      discountType === 'flat'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ₹ Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg transition-all ${
                      discountType === 'percentage'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    % Off
                  </button>
                </div>
              </div>

              {/* 1-Tap Quick Discount Chips */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {[
                  { label: '0%', val: '0' },
                  { label: '5% Off', val: '5' },
                  { label: '10% Off', val: '10' },
                  { label: '15% Off', val: '15' },
                ].map((chip) => {
                  const isChipActive =
                    discountType === 'percentage' && discountValueInput === chip.val;
                  return (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => {
                        setDiscountType('percentage');
                        setDiscountValueInput(chip.val);
                      }}
                      className={`py-1.5 px-1 rounded-xl text-xs font-bold transition text-center border active:scale-95 ${
                        isChipActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? 100 : subtotal}
                  value={discountValueInput}
                  onChange={(e) => setDiscountValueInput(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'Custom % (e.g. 10)' : 'Custom ₹ (e.g. 25000)'}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600">
                  {discountType === 'percentage' ? '%' : '₹'}
                </span>
              </div>

              {calculatedDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 p-1.5 px-2.5 rounded-xl border border-emerald-200 font-semibold">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Discount Applied:
                  </span>
                  <span>-{formatINR(calculatedDiscountAmount)}</span>
                </div>
              )}
            </div>

            {/* Customer Name Input (Mandatory) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Customer Name</span>
                  <span className="text-rose-500 font-bold">*</span>
                </span>
                <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Required
                </span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Customer WhatsApp 10-Digit Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Customer WhatsApp Number</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Direct WhatsApp
                </span>
              </label>
              
              <div className="flex items-center rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/25 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border-r border-emerald-200 text-xs font-bold text-emerald-800 select-none shrink-0">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 bg-transparent text-sm font-semibold tracking-wider text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Customization / Order Notes (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Order Notes / Customizations</span>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Sage Green Velvet, deliver by Dec 15th"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Advance Deposit / Booking Token (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Advance Token Received (₹)</span>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={finalPrice}
                  value={advanceDepositInput}
                  onChange={(e) => setAdvanceDepositInput(e.target.value)}
                  placeholder="e.g. 50000 (if booking advance received)"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹ INR
                </span>
              </div>
              {advanceDeposit > 0 && (
                <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200 font-semibold mt-1">
                  <span>Balance Due on Delivery:</span>
                  <span className="font-bold">{formatINR(balanceDue)}</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}
          </div>

          {/* 3. Pinned Bottom Section - 100% Inside Card Bounds */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 shrink-0 space-y-3">
            {/* Final Price Summary */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700 block">
                  Final Total
                </span>
                <span className="text-[10px] text-slate-400">All taxes included</span>
              </div>
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                {formatINR(finalPrice)}
              </span>
            </div>

            {advanceDeposit > 0 && (
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                <span>Balance Due on Delivery:</span>
                <span className="font-mono text-sm">{formatINR(balanceDue)}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              disabled={
                isPending ||
                selectedProducts.length === 0 ||
                !customerName.trim() ||
                !isValidWhatsapp
              }
              onClick={handleGenerateQuote}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-400/30"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Opening WhatsApp...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Send Quote on WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
