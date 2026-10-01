import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, ArrowLeft, ShieldCheck, Gift, CreditCard, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Order Status | IPTV Order Portal',
  description: 'Your IPTV subscription or free trial request has been received.',
  robots: { index: false, follow: false },
};

function ConfirmationContent({
  searchParams,
}: {
  searchParams: { orderId?: string; type?: string; checkoutUrl?: string };
}) {
  const orderId = searchParams.orderId || 'IPTV-PENDING';
  const isTrial = searchParams.type === 'trial';
  const checkoutUrl = searchParams.checkoutUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/30 py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl shadow-indigo-950/[0.04] p-6 sm:p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          {isTrial ? (
            <Gift className="w-8 h-8 text-emerald-600" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          )}
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isTrial ? 'Free Trial Requested' : 'Order Placed'}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          {isTrial
            ? 'Your free trial request has been received successfully.'
            : 'Your order has been registered. Please complete your payment below.'}
        </p>

        {/* Reference Box */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
          <div className="flex justify-between items-center mb-1 text-xs text-slate-500 font-medium">
            <span>{isTrial ? 'Trial Reference' : 'Order Reference'}</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Received
            </span>
          </div>
          <p className="font-mono text-base font-bold text-slate-900 tracking-wide">
            {orderId}
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Please keep this reference number handy for your records or when communicating with customer support.
          </p>
        </div>

        {/* Instructions */}
        <p className="mt-6 text-xs sm:text-sm text-slate-600">
          {isTrial
            ? 'Please return to your WhatsApp conversation with our agent and send this reference number to receive your instant trial line.'
            : 'If your payment window did not open automatically, click the button below to proceed to the secure CardToUSDT payment page.'}
        </p>

        {/* Action CTAs */}
        <div className="mt-6 space-y-3">
          {/* CardToUSDT Checkout CTA for paid orders */}
          {checkoutUrl && !isTrial && (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-base shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Complete Payment on CardToUSDT</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>
          )}

          {/* Return to WhatsApp CTA */}
          <a
            href="https://wa.me"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-base shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Return to WhatsApp</span>
          </a>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 pt-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Order Form</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId?: string; type?: string; checkoutUrl?: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
          Loading order details...
        </div>
      }
    >
      <ConfirmationContent searchParams={searchParams} />
    </Suspense>
  );
}
