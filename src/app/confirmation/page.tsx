'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  Gift,
  CreditCard,
  ExternalLink,
  Camera,
  Copy,
  Check,
  Printer,
  Clock,
  Landmark,
  DollarSign,
  FileText,
  User,
  Tv,
} from 'lucide-react';

const PLAN_LABELS: Record<string, string> = {
  free_trial: '24-Hour Free Trial',
  '1_month': '1 Month VIP Subscription',
  '3_months': '3 Months VIP Subscription',
  '6_months': '6 Months VIP Subscription',
  '12_months': '12 Months VIP Subscription',
};

const METHOD_LABELS: Record<string, { name: string; color: string; badge: string }> = {
  paypal: {
    name: 'PayPal',
    color: 'text-[#003087]',
    badge: 'Manual WhatsApp Verification',
  },
  bank_transfer: {
    name: 'Bank Transfer (Wire / IBAN)',
    color: 'text-purple-600',
    badge: 'Direct Wire Verification',
  },
  cash_app: {
    name: 'Cash App',
    color: 'text-[#00D632]',
    badge: 'Cashtag Verification',
  },
  card: {
    name: 'Credit / Debit Card & Crypto',
    color: 'text-indigo-600',
    badge: 'CardToUSDT Automated Checkout',
  },
  trial: {
    name: 'Free Trial',
    color: 'text-emerald-600',
    badge: 'No Payment Required',
  },
};

function InvoiceContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || 'IPTV-PENDING';
  const method = searchParams.get('method') || (searchParams.get('type') === 'trial' ? 'trial' : 'card');
  const isTrial = method === 'trial' || searchParams.get('type') === 'trial';
  const planKey = searchParams.get('plan') || (isTrial ? 'free_trial' : '1_month');
  const planName = PLAN_LABELS[planKey] || planKey;
  const devices = searchParams.get('devices') || '1';
  const price = searchParams.get('price') || (isTrial ? '0' : '15');
  const customerName = searchParams.get('name') || '';
  const customerEmail = searchParams.get('email') || '';
  const customerPhone = searchParams.get('phone') || '';
  const customerCountry = searchParams.get('country') || '';
  const customerDevice = searchParams.get('device') || '';
  const checkoutUrl = searchParams.get('checkoutUrl') || '';

  const [copied, setCopied] = useState(false);

  const methodMeta = METHOD_LABELS[method] || METHOD_LABELS.card;
  const isWhatsAppMethod = method === 'paypal' || method === 'bank_transfer' || method === 'cash_app';

  // Construct prefilled WhatsApp message
  const whatsappText = encodeURIComponent(
    `Hello! I just placed an order on pay2me.online.\n\n` +
      `📋 Order/Invoice: ${orderId}\n` +
      `📦 Plan: ${planName} (${devices} Device${Number(devices) > 1 ? 's' : ''})\n` +
      `💰 Amount Due: $${price} USD\n` +
      `💳 Payment Method: ${methodMeta.name}\n` +
      (customerName ? `👤 Customer: ${customerName}\n` : '') +
      `\nI have taken a screenshot of my invoice. Please send me the payment instructions!`
  );

  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  const handleCopyInvoice = () => {
    const textToCopy =
      `Pay2Me Order Invoice\n` +
      `Invoice #: ${orderId}\n` +
      `Plan: ${planName} (${devices} Devices)\n` +
      `Amount: $${price} USD\n` +
      `Method: ${methodMeta.name}\n` +
      (customerName ? `Customer: ${customerName}\n` : '');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/25 to-slate-100 py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/[0.06] overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-300">
                  {isTrial ? 'Free Trial Request' : 'Order Invoice'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white font-mono">
                {orderId}
              </h1>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Clock className="w-3.5 h-3.5" />
                {isTrial ? 'Pending Activation' : 'Pending Payment'}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Alert Banner: Screenshot Requirement */}
        {isWhatsAppMethod && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 sm:p-5 flex items-start gap-3 shadow-inner">
            <div className="p-2 rounded-xl bg-slate-950/10 flex-shrink-0 mt-0.5">
              <Camera className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex-1 text-xs sm:text-sm">
              <strong className="block text-sm sm:text-base font-black uppercase tracking-wide">
                📸 Step 1: Take a Screenshot of this Invoice
              </strong>
              <p className="mt-0.5 text-slate-900/90 leading-relaxed font-medium">
                Please <strong>take a screenshot of this page right now</strong> and send it to our seller on WhatsApp. We will provide your {methodMeta.name} payment details and activate your subscription immediately after!
              </p>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-8 space-y-6">
          
          {/* Itemized Order & Invoice Table */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="p-4 bg-slate-100/70 border-b border-slate-200/70 flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Invoice Breakdown
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                Pay2Me IPTV Services
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm">
              {/* Plan */}
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Tv className="w-4 h-4 text-slate-400" /> Subscription Plan:
                </span>
                <span className="font-bold text-slate-900">{planName}</span>
              </div>

              {/* Devices */}
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Connections:</span>
                <span className="font-bold text-slate-900">
                  {devices} {Number(devices) === 1 ? 'Device Connection' : 'Device Connections'}
                </span>
              </div>

              {/* Customer Info (if available) */}
              {customerName && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <User className="w-4 h-4 text-slate-400" /> Billed To:
                  </span>
                  <span className="font-bold text-slate-900">{customerName}</span>
                </div>
              )}

              {customerPhone && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">WhatsApp Phone:</span>
                  <span className="font-mono font-bold text-slate-900">{customerPhone}</span>
                </div>
              )}

              {/* Payment Method */}
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Selected Payment Method:</span>
                <span className={`font-black flex items-center gap-1.5 ${methodMeta.color}`}>
                  {method === 'paypal' && <span className="font-bold">PayPal</span>}
                  {method === 'bank_transfer' && <Landmark className="w-4 h-4" />}
                  {method === 'cash_app' && <DollarSign className="w-4 h-4" />}
                  {method === 'card' && <CreditCard className="w-4 h-4" />}
                  {method === 'trial' && <Gift className="w-4 h-4" />}
                  <span>{methodMeta.name}</span>
                </span>
              </div>

              {/* Total Price */}
              <div className="pt-2 flex justify-between items-baseline">
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  Total Amount Due:
                </span>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight font-mono">
                    ${price} <span className="text-xs font-semibold text-slate-500">USD</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Specific Instructions Box */}
          {method === 'paypal' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-2 text-sky-900">
                <span className="px-2 py-0.5 rounded bg-sky-600 text-white font-mono text-xs">PayPal</span>
                How to Complete Your PayPal Payment:
              </h3>
              <ol className="text-xs sm:text-sm text-sky-900/90 list-decimal pl-5 space-y-1.5 leading-relaxed font-medium">
                <li>
                  Click the <strong>"Contact Seller on WhatsApp"</strong> button below.
                </li>
                <li>
                  Ask our support representative for our <strong>official PayPal email address</strong>.
                </li>
                <li>
                  Send the payment of <strong>${price} USD</strong>.
                </li>
                <li>
                  Attach your <strong>invoice screenshot</strong> and transaction ID in the chat for instant activation!
                </li>
              </ol>
            </div>
          )}

          {method === 'bank_transfer' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-2 text-purple-900">
                <Landmark className="w-4 h-4 text-purple-700" />
                How to Complete Your Bank Transfer:
              </h3>
              <ol className="text-xs sm:text-sm text-purple-900/90 list-decimal pl-5 space-y-1.5 leading-relaxed font-medium">
                <li>
                  Click the <strong>"Contact Seller on WhatsApp"</strong> button below.
                </li>
                <li>
                  Ask our representative for our <strong>Bank Account / IBAN / Wire transfer details</strong>.
                </li>
                <li>
                  Execute the transfer for <strong>${price} USD</strong>.
                </li>
                <li>
                  Send your <strong>bank confirmation slip</strong> together with this invoice screenshot to activate your account.
                </li>
              </ol>
            </div>
          )}

          {method === 'cash_app' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-900">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                How to Complete Your Cash App Payment:
              </h3>
              <ol className="text-xs sm:text-sm text-emerald-900/90 list-decimal pl-5 space-y-1.5 leading-relaxed font-medium">
                <li>
                  Click the <strong>"Contact Seller on WhatsApp"</strong> button below.
                </li>
                <li>
                  Request our active <strong>$Cashtag</strong> from our agent.
                </li>
                <li>
                  Send the payment of <strong>${price} USD</strong> via Cash App.
                </li>
                <li>
                  Share your payment confirmation and this invoice screenshot on WhatsApp for instant delivery!
                </li>
              </ol>
            </div>
          )}

          {/* Card / Crypto (CardToUSDT) CTA if applicable */}
          {method === 'card' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-2.5 text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Identity Verification (KYC) Required</span>
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                Card payments require standard identity verification (ID / KYC check) on the CardToUSDT payment gateway. Please ensure you have your ID ready to finalize your transaction.
              </p>
              {checkoutUrl && (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-base shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Open CardToUSDT Checkout</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                </a>
              )}
            </div>
          )}

          {/* Free Trial Instructions */}
          {isTrial && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm leading-relaxed">
              <strong className="block font-bold text-emerald-900 mb-1">
                🎉 Free Trial Request Confirmed!
              </strong>
              Please message our agent on WhatsApp with your reference <strong>{orderId}</strong> to receive your instant trial credentials.
            </div>
          )}

          {/* Primary WhatsApp Action Button */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1caa52] text-white font-extrabold text-base sm:text-lg shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-center"
            >
              <MessageCircle className="w-6 h-6 fill-white flex-shrink-0" />
              <span>
                {isWhatsAppMethod ? 'Send Screenshot on WhatsApp' : 'Contact Support on WhatsApp'}
              </span>
            </a>

            {/* Helper Action Buttons: Copy & Print */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyInvoice}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Invoice Info</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Back to Order Form Link */}
          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Place Another Order</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
          Loading order invoice...
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  );
}
