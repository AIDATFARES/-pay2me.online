import React from 'react';
import { DeviceCount, PaymentMethodId, SubscriptionPlanId } from '@/types/order';
import { SUBSCRIPTION_PLANS, FIXED_PRICES } from '@/config/pricing';
import { Lock, ArrowRight, Loader2, CheckCircle2, Shield, Gift, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderSummaryProps {
  selectedPlan: SubscriptionPlanId;
  selectedDevices: DeviceCount;
  selectedPaymentMethod?: PaymentMethodId;
  isSubmitting: boolean;
  onSubmit: () => void;
  apiError?: string | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedPlan,
  selectedDevices,
  selectedPaymentMethod = 'card',
  isSubmitting,
  onSubmit,
  apiError,
}) => {
  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan);
  const planName = currentPlan ? currentPlan.name : selectedPlan;
  const fixedTotal = FIXED_PRICES[selectedPlan][selectedDevices];
  const isFree = fixedTotal === 0;

  const getButtonLabel = () => {
    if (isFree) return 'Get Free Trial Now';
    switch (selectedPaymentMethod) {
      case 'paypal':
        return 'Pay with PayPal';
      case 'bank_transfer':
        return 'Pay via Bank Transfer';
      case 'card':
      default:
        return 'Continue to Payment';
    }
  };

  const getLoadingLabel = () => {
    if (isFree) return 'Activating Free Trial...';
    if (selectedPaymentMethod === 'card') return 'Connecting to Secure Checkout...';
    return 'Generating Invoice...';
  };

  return (
    <section className="mt-8 pt-6 border-t border-slate-200/90">
      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/70">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Order Summary
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center text-slate-600">
            <span>Plan</span>
            <span className="font-semibold text-slate-800">{planName}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Devices</span>
            <span className="font-semibold text-slate-800">
              {selectedDevices} {selectedDevices === 1 ? 'Device' : 'Devices'}
            </span>
          </div>

          {!isFree && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Payment Method</span>
              <span className="font-semibold text-slate-800 capitalize">
                {selectedPaymentMethod === 'card'
                  ? 'Card, Cash App & Crypto'
                  : selectedPaymentMethod === 'bank_transfer'
                  ? 'Bank Transfer'
                  : 'PayPal'}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-base font-bold text-slate-900">Total</span>
            <div className="text-right">
              <span
                className={cn(
                  'text-2xl sm:text-3xl font-extrabold tracking-tight',
                  isFree ? 'text-emerald-600' : 'text-indigo-700'
                )}
              >
                ${fixedTotal}
              </span>
              <span className="block text-[11px] text-slate-400 font-medium">
                {isFree ? '100% Free • No credit card required' : 'One-time payment • No auto-renewal'}
              </span>
            </div>
          </div>
        </div>

        {apiError && (
          <div className="mt-3.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <span>⚠️</span>
            <p className="flex-1">{apiError}</p>
          </div>
        )}

        {/* CTA Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className={cn(
            'mt-4 w-full py-3.5 px-4 rounded-xl text-white font-bold text-base shadow-md transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer',
            isFree
              ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/20 hover:shadow-emerald-600/30'
              : selectedPaymentMethod === 'paypal'
              ? 'bg-[#0070BA] hover:bg-[#005ea6] active:bg-[#004c86] shadow-sky-600/20 hover:shadow-lg'
              : selectedPaymentMethod === 'bank_transfer'
              ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 shadow-purple-600/20 hover:shadow-lg'
              : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{getLoadingLabel()}</span>
            </>
          ) : isFree ? (
            <>
              <Gift className="w-5 h-5" />
              <span>{getButtonLabel()}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          ) : (
            <>
              <span>{getButtonLabel()}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>

        {/* Security badges */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3 text-slate-400" /> 256-bit Encrypted
          </span>
          <span className="flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Instant Activation
          </span>
          {isFree ? (
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> No Payment Details Needed
            </span>
          ) : selectedPaymentMethod === 'card' ? (
            <span className="flex items-center gap-1 font-medium">
              <Shield className="w-3 h-3 text-indigo-500" /> CardToUSDT Guaranteed
            </span>
          ) : (
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <MessageCircle className="w-3 h-3 text-[#25D366]" /> WhatsApp Verified Support
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
