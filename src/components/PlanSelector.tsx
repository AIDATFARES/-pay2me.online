import React from 'react';
import { SubscriptionPlanId } from '@/types/order';
import { SUBSCRIPTION_PLANS, FIXED_PRICES } from '@/config/pricing';
import { Check, Sparkles, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanSelectorProps {
  selectedPlan: SubscriptionPlanId;
  onSelectPlan: (planId: SubscriptionPlanId) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ selectedPlan, onSelectPlan }) => {
  const freePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'free_trial');
  const paidPlans = SUBSCRIPTION_PLANS.filter((p) => p.id !== 'free_trial');

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

      {/* Free Plan Card (Prominent Top Card) */}
      {freePlan && (
        <div className="mb-3.5">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onSelectPlan(freePlan.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPlan(freePlan.id);
              }
            }}
            className={cn(
              'relative p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all duration-150 border text-left outline-none select-none',
              selectedPlan === 'free_trial'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
                      {freePlan.badge || 'Free Test'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Instant trial access • No credit card required
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">
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
              </div>
            </div>

            {/* Benefits when selected or preview */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1">
              {freePlan.benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center gap-1 text-[11px] text-slate-600">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Paid Subscription Plans (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3">
        {paidPlans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const basePrice = FIXED_PRICES[plan.id][1];

          return (
            <div
              key={plan.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPlan(plan.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPlan(plan.id);
                }
              }}
              className={cn(
                'relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all duration-150 border text-left outline-none select-none',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/40'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-start justify-between">
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {plan.name}
                  </span>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    ${basePrice}
                  </span>
                </div>
              </div>

              {/* Short clean list of benefits (no device counts) */}
              <ul className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                {plan.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};
