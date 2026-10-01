import React, { useState } from 'react';
import { SubscriptionPlanId } from '@/types/order';
import { SUBSCRIPTION_PLANS, FIXED_PRICES } from '@/config/pricing';
import { Check, Sparkles, Gift, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanSelectorProps {
  selectedPlan: SubscriptionPlanId;
  onSelectPlan: (planId: SubscriptionPlanId) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ selectedPlan, onSelectPlan }) => {
  const [expandedPlanId, setExpandedPlanId] = useState<SubscriptionPlanId | null>(null);

  const freePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'free_trial');
  const paidPlans = SUBSCRIPTION_PLANS.filter((p) => p.id !== 'free_trial');

  const handleCardClick = (planId: SubscriptionPlanId) => {
    onSelectPlan(planId);
    // Reveal card details when clicked (toggle if clicked again)
    setExpandedPlanId((prev) => (prev === planId ? null : planId));
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Choose Your Plan
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">Select 1 option</span>
      </div>

      {/* Free Plan Card (Compact: reveals details only when clicked) */}
      {freePlan && (
        <div className="mb-3.5">
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(freePlan.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(freePlan.id);
              }
            }}
            className={cn(
              'relative p-3 sm:p-3.5 rounded-xl cursor-pointer transition-all duration-200 border text-left outline-none select-none',
              selectedPlan === 'free_trial'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                    selectedPlan === 'free_trial'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-700'
                  )}
                >
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      {freePlan.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {freePlan.badge || '100% Free'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
                  $0
                </span>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                    selectedPlan === 'free_trial'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  )}
                >
                  {selectedPlan === 'free_trial' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform duration-200',
                    expandedPlanId === freePlan.id && 'rotate-180 text-emerald-600'
                  )}
                />
              </div>
            </div>

            {/* Revealed details only when clicked */}
            {expandedPlanId === freePlan.id && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-x-4 gap-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                {freePlan.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paid Subscription Plans (Compact: displaying only Price and Duration; reveals details when clicked) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {paidPlans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isExpanded = expandedPlanId === plan.id;
          const basePrice = FIXED_PRICES[plan.id][1];

          return (
            <div
              key={plan.id}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(plan.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(plan.id);
                }
              }}
              className={cn(
                'relative flex flex-col justify-between p-3 sm:p-3.5 rounded-xl cursor-pointer transition-all duration-200 border text-left outline-none select-none',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  {plan.badge}
                </div>
              )}

              {/* Compact Card Header: Duration, Price, and Radio Indicator */}
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {plan.name}
                  </span>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5',
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    ${basePrice}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-slate-400 transition-transform duration-200',
                      isExpanded && 'rotate-180 text-indigo-600'
                    )}
                  />
                </div>
              </div>

              {/* Revealed Content: Card Details / Features List shown ONLY when clicked */}
              {isExpanded && (
                <ul className="mt-2.5 pt-2.5 border-t border-slate-200/80 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
