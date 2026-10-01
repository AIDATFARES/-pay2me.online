import React from 'react';
import { PaymentMethodId, SubscriptionPlanId } from '@/types/order';
import { CreditCard, Landmark, DollarSign, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  selectedPlan: SubscriptionPlanId;
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
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
}) => {
  // If Free Trial is selected, hide the payment method selector since no payment is required
  if (selectedPlan === 'free_trial') {
    return null;
  }

  const paymentOptions: PaymentOption[] = [
    {
      id: 'card',
      title: 'Credit / Debit Card & Crypto',
      subtitle: 'Visa, Mastercard, USDT, Crypto',
      badge: 'Instant Automated',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
    {
      id: 'cash_app',
      title: 'Cash App',
      subtitle: 'Request $Cashtag details on WhatsApp',
      badge: 'Fast Pay',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <DollarSign className="w-5 h-5 text-emerald-600 stroke-[2.5]" />,
    },
  ];

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
              onClick={() => onSelectMethod(option.id)}
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

      {/* Dynamic Instruction Helper Box based on selection */}
      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
        {selectedMethod === 'card' ? (
          <>
            <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Automated Checkout:</strong> You will be forwarded to the secure CardToUSDT payment page in a new tab. Instant line activation upon payment.
            </p>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4 text-[#25D366] flex-shrink-0 mt-0.5" />
            <p>
              <strong>Screenshot Verification:</strong> After clicking Pay, you will receive your official invoice. Send a screenshot to our WhatsApp support agent to receive {selectedMethod === 'paypal' ? 'our active PayPal email address' : selectedMethod === 'bank_transfer' ? 'our bank account IBAN/wire details' : 'our official $Cashtag'} and get instant setup.
            </p>
          </>
        )}
      </div>
    </section>
  );
};
