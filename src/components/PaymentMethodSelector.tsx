import React from 'react';
import { PaymentMethodId, SubscriptionPlanId } from '@/types/order';
import { CreditCard, Landmark, MessageCircle, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  selectedPlan: SubscriptionPlanId;
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  isAgreed: boolean;
  onToggleAgreement: (agreed: boolean) => void;
  error?: string | null;
}

interface PaymentOption {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedPlan,
  selectedMethod,
  onSelectMethod,
  isAgreed,
  onToggleAgreement,
  error,
}) => {
  // If Free Trial is selected, hide the payment method selector since no payment is required
  if (selectedPlan === 'free_trial') {
    return null;
  }

  const paymentOptions: PaymentOption[] = [
    {
      id: 'card',
      title: 'Credit / Debit Card, Cash App & Crypto',
      subtitle: 'Visa, Mastercard, Cash App, USDT (ID Verification Required)',
      badge: 'ID Verification Required',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'paypal',
      title: 'PayPal',
      subtitle: 'Request PayPal email on WhatsApp',
      badge: 'WhatsApp Verified',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: (
        <span className="font-bold text-sm text-[#003087] flex items-center justify-center w-5 h-5">
          PP
        </span>
      ),
    },
    {
      id: 'bank_transfer',
      title: 'Bank Transfer',
      subtitle: 'Request IBAN / Wire details on WhatsApp',
      badge: 'Direct Wire',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <Landmark className="w-5 h-5 text-purple-600" />,
    },
  ];

  const getMethodTitle = () => {
    switch (selectedMethod) {
      case 'paypal':
        return 'our active PayPal email address';
      case 'bank_transfer':
        return 'our bank account IBAN / wire details';
      case 'card':
      default:
        return 'CardToUSDT payment details';
    }
  };

  return (
    <section className="mb-6 pt-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
          4
        </span>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Select Payment Method
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-slate-500 mb-3 ml-8">
        Choose how you would like to pay for your subscription.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {paymentOptions.map((option) => {
          const isSelected = selectedMethod === option.id;

          return (
            <button
              type="button"
              key={option.id}
              onClick={() => {
                onSelectMethod(option.id);
                // Reset agreement when changing method so user explicitly confirms the new method
                onToggleAgreement(false);
              }}
              className={cn(
                'relative flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 outline-none select-none cursor-pointer',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-2 ring-indigo-500/20 text-indigo-950'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 text-slate-700'
              )}
            >
              {/* Radio Indicator */}
              <div className="pt-0.5 flex-shrink-0">
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-slate-300 bg-white'
                  )}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              {/* Icon Container */}
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected ? 'bg-white shadow-xs' : 'bg-slate-100'
                )}
              >
                {option.icon}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 leading-snug">
                    {option.title}
                  </span>
                  {option.badge && (
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full border',
                        option.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                      )}
                    >
                      {option.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                  {option.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mandatory Checkbox Agreement Box (Must be clicked and agreed to) */}
      <div
        className={cn(
          'mt-3.5 p-3.5 rounded-xl border transition-all select-none',
          error
            ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-200 text-rose-950'
            : isAgreed
            ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/25 text-emerald-950'
            : selectedMethod === 'card'
            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        )}
      >
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => onToggleAgreement(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-indigo-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
          />
          <div className="text-xs leading-relaxed flex-1">
            {selectedMethod === 'card' ? (
              <p>
                <strong className="font-bold text-slate-900 block mb-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Identity Verification (KYC) Required for Card & Cash App Payments <span className="text-rose-500">*</span>
                </strong>
                <strong>Please Note:</strong> Card and Cash App payments require <strong>identity verification (ID / KYC verification)</strong> on the payment gateway. I confirm that I have read this and agree that I will be redirected to the secure CardToUSDT payment page in a new tab, and <strong>I agree to complete the required identity verification</strong> to complete my card / Cash App payment.
              </p>
            ) : (
              <p>
                <strong className="font-bold text-slate-900 block mb-0.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  Screenshot Verification Agreement <span className="text-rose-500">*</span>
                </strong>
                I confirm that I have read this and agree that after clicking Pay, I will receive an official invoice page. I agree to <strong>take a screenshot of the invoice and send it to the seller on WhatsApp</strong> to receive {getMethodTitle()} and get instant setup.
              </p>
            )}
          </div>
        </label>

        {error && (
          <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1 pl-6">
            <span>⚠️</span> {error}
          </p>
        )}
      </div>
    </section>
  );
};
