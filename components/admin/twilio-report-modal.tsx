'use client';

import React, { useState } from 'react';
import { dispatchTest10pmReportAction } from '@/app/(admin)/admin/actions';
import { Moon, Send, CheckCircle2, AlertCircle, X, Smartphone, Key, RefreshCw } from 'lucide-react';

interface TwilioReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerPhone?: string;
}

export function TwilioReportModal({
  isOpen,
  onClose,
  ownerPhone = '+91 7676482481',
}: TwilioReportModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    sid?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSendTest = async () => {
    setIsSending(true);
    setResultMessage(null);

    try {
      const res = await dispatchTest10pmReportAction();
      if (res.success) {
        if (res.result.simulated) {
          setResultMessage({
            type: 'info',
            text: `Report compiled! Running in simulated mode because TWILIO_ACCOUNT_SID is not yet added in environment. Once added, it will be delivered directly to ${ownerPhone}.`,
          });
        } else {
          setResultMessage({
            type: 'success',
            text: `Success! Test WhatsApp message delivered to ${ownerPhone}.`,
            sid: res.result.sid,
          });
        }
      } else {
        setResultMessage({
          type: 'error',
          text: res.result.error || 'Failed to dispatch WhatsApp message.',
        });
      }
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Network error occurred.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Moon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-slate-900">
              10:00 PM WhatsApp Closing Report
            </h3>
            <p className="text-xs text-slate-500">
              Automated nightly summary sent via Twilio WhatsApp API.
            </p>
          </div>
        </div>

        {/* Status card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Nightly Schedule:</span>
            <span className="font-bold text-slate-800">Every Night at 10:00 PM IST</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Recipient (Owner):</span>
            <span className="font-bold text-indigo-600 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
              {ownerPhone}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">API Engine:</span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Twilio WhatsApp Business REST API
            </span>
          </div>
        </div>

        {/* Result alert */}
        {resultMessage && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 ${
              resultMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : resultMessage.type === 'info'
                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {resultMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div>{resultMessage.text}</div>
              {resultMessage.sid && (
                <div className="font-mono text-[11px] text-emerald-700 font-normal">
                  Message SID: {resultMessage.sid}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Integration Instructions */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
          <strong className="block mb-1 text-amber-950 font-bold flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-amber-700" />
            Twilio Environment Variables
          </strong>
          To receive real messages on WhatsApp, add your free trial keys in your environment (Vercel or <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">.env.local</code>):
          <div className="mt-1.5 font-mono text-[10px] bg-white/80 p-2 rounded-xl border border-amber-200/60 space-y-0.5">
            <div>TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx</div>
            <div>TWILIO_AUTH_TOKEN=your_token</div>
            <div>OWNER_WHATSAPP_NUMBER=7676482481</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition text-center"
          >
            Close
          </button>
          <button
            type="button"
            disabled={isSending}
            onClick={handleSendTest}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Test WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
