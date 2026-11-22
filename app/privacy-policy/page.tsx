import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy (DPDP Act 2023) | Alishan Furnitures',
  description:
    'Statutory Data Privacy Policy complying with the Digital Personal Data Protection Act, 2023 (DPDP Act) of the Republic of India.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#171513] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-10">
        <div className="flex items-center justify-between pb-6 border-b border-stone-200">
          <Link
            href="/sales"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Showroom
          </Link>
          <span className="text-[11px] font-mono px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full font-medium">
            DPDP Act 2023 Compliant
          </span>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 font-serif">
                Digital Privacy Policy
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Last updated: 22 November 2026 • Statutory Alignment with Digital Personal Data Protection Act (DPDP Act 2023)
              </p>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-sm text-stone-700 leading-relaxed space-y-6">
            <section className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 m-0">
                <Lock className="w-4 h-4 text-amber-700" /> Executive Commitment
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 m-0">
                Alishan Furnitures (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy and dignity of our clients. In compliance with the Digital Personal Data Protection Act, 2023 (Republic of India), this document provides transparent, plain-language notification of our data processing standards.
              </p>
            </section>

            {/* Section 1: Categories of Data */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                1. What Personal Data We Collect (DPDP Sec 5)
              </h2>
              <p>We collect only the minimum necessary data to prepare and deliver furniture quotations:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Customer Identity:</strong> Full Name provided on the showroom floor.</li>
                <li><strong>Contact Data:</strong> 10-digit Indian WhatsApp mobile number for quote delivery.</li>
                <li><strong>Quotation Records:</strong> Selected furniture pieces, dimensions, fabrics, agreed discount, advance token deposit, and balance due.</li>
                <li><strong>Delivery Notes:</strong> Specific room dimensions or client floor customization requests.</li>
              </ul>
              <p className="text-xs text-stone-500 italic mt-1">
                Note: We never collect Aadhaar numbers, biometric data, religious data, or financial banking credentials.
              </p>
            </section>

            {/* Section 2: Purpose of Processing */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                2. Purpose of Processing (DPDP Sec 5 & 6)
              </h2>
              <p>Your data is processed strictly for the following verified purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Generating and transmitting the official PDF quotation directly to your personal WhatsApp.</li>
                <li>Scheduling physical delivery and room measurement visits.</li>
                <li>Maintaining the 24-hour stock hold reservation to ensure your selected furniture pieces are not sold to another buyer while you evaluate your quote.</li>
              </ul>
            </section>

            {/* Section 3: Third-Party Transmission */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                3. Third-Party Data Transmission & Zero Data Selling
              </h2>
              <p>
                We <strong>never sell, lease, or monetize</strong> client contact information to advertisers, telemarketers, or loan agencies. Data transmission is limited exclusively to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>WhatsApp / Meta Platform:</strong> Purely for transmission of your PDF quote via WhatsApp end-to-end encrypted messaging.</li>
                <li><strong>Direct Showroom Logistics:</strong> In-house delivery team for final assembly and delivery coordination.</li>
              </ul>
            </section>

            {/* Section 4: Data Retention Duration */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                4. Data Retention Duration (DPDP Sec 8)
              </h2>
              <p>
                Showroom price quotations are valid for <strong>24 hours</strong> from generation. Unconverted prospect records are scheduled for automated archiving after 90 days. For fulfilled orders, sales receipts and warranty records are retained for statutory tax compliance under Indian GST laws.
              </p>
            </section>

            {/* Section 5: Rights of Data Principals */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                5. Your Statutory Rights (DPDP Sec 11 - 14)
              </h2>
              <p>Under the DPDP Act 2023, you hold the following unassailable legal rights:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Right to Access:</strong> Request a full summary of personal data held regarding your quotes.</li>
                <li><strong>Right to Correction:</strong> Update or rectify erroneous names or mobile numbers.</li>
                <li><strong>Right to Erasure:</strong> Request the deletion of your quotation and contact data from our active queue.</li>
                <li><strong>Right to Withdraw Consent:</strong> You may revoke consent to receive WhatsApp messages at any moment by sending &quot;STOP&quot; or emailing our Grievance Officer.</li>
              </ul>
            </section>

            {/* Section 6: Protection of Children & Minors */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                6. Children & Minor Data Policy (DPDP Sec 9)
              </h2>
              <p>
                Alishan Furnitures showroom services are intended solely for adult consumers (aged 18 and older) legally competent to enter commercial furniture contracts in India. We do not knowingly process personal data relating to minors without verifiable parental or guardian consent.
              </p>
            </section>

            {/* Section 7: Grievance Redressal Officer */}
            <section className="bg-amber-50/60 p-5 rounded-xl border border-amber-200">
              <h2 className="text-base font-bold text-amber-950 flex items-center gap-2 m-0">
                <FileText className="w-5 h-5 text-amber-800" />
                Designated Statutory Grievance Redressal Officer (DPDP Sec 11)
              </h2>
              <p className="text-xs text-amber-900 mt-2 mb-3">
                In compliance with Section 11 of the Digital Personal Data Protection Act, 2023, clients may submit privacy inquiries or exercise their statutory rights directly to our designated Grievance Officer:
              </p>
              <div className="text-xs text-stone-800 space-y-1 font-mono bg-white p-3.5 rounded-lg border border-amber-200/80">
                <p><strong>Officer Name:</strong> Vikram Mehta (Showroom Director / Data Protection Lead)</p>
                <p><strong>Designation:</strong> Data Grievance Redressal Officer</p>
                <p><strong>Physical Address:</strong> Alishan Furnitures Showroom, Commercial Axis, Karnataka, India</p>
                <p><strong>Official Email:</strong> grievance@alishanfurnitures.com</p>
                <p><strong>WhatsApp Support:</strong> +91 7676482481</p>
                <p><strong>Statutory Turnaround:</strong> Acknowledgment within <strong>72 hours</strong>; full resolution within <strong>30 calendar days</strong>.</p>
              </div>
            </section>

            {/* Section 8: Data Breach Notification */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                7. DPBI Breach Notification Protocol (DPDP Sec 8)
              </h2>
              <p>
                In the unlikely event of any security incident compromising personal data, Alishan Furnitures maintains a technical protocol ensuring immediate notification to both affected data principals and the <strong>Data Protection Board of India (DPBI)</strong> in the form and manner stipulated by statutory rules.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>© {new Date().getFullYear()} Alishan Furnitures • All Rights Reserved</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-stone-900 underline underline-offset-4">
              Terms & Conditions
            </Link>
            <Link href="/sales" className="hover:text-stone-900 underline underline-offset-4">
              Sales Floor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
