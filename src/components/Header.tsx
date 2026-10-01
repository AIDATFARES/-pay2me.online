import React from 'react';
import { Tv2, ShieldCheck, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="text-center pt-2 pb-6">
      {/* Brand Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-3">
        <Tv2 className="w-3.5 h-3.5 text-indigo-600" />
        <span>Pay2Me • Instant IPTV Activation</span>
      </div>

      {/* Main Heading H1 */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Get Your IPTV Subscription
        </h1>

      {/* Short Description */}
      <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
        Choose your plan, select your devices, and complete your order.
      </p>

        {/* Mini Trust Points */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Delivery
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Secure Checkout
          </span>
        </div>
    </header>
  );
};

