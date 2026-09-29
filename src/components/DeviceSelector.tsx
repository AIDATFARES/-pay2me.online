import React from 'react';
import { DeviceCount, SubscriptionPlanId } from '@/types/order';
import { DEVICE_OPTIONS, FIXED_PRICES } from '@/config/pricing';
import { Monitor, Smartphone, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceSelectorProps {
  selectedPlan: SubscriptionPlanId;
  selectedDevices: DeviceCount;
  onSelectDevices: (count: DeviceCount) => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedPlan,
  selectedDevices,
  onSelectDevices,
}) => {
  const isFreeTrial = selectedPlan === 'free_trial';

  const getDeviceIcon = (count: DeviceCount) => {
    switch (count) {
      case 1:
        return <Tv className="w-4 h-4" />;
      case 2:
        return (
          <div className="flex -space-x-1">
            <Tv className="w-3.5 h-3.5" />
            <Monitor className="w-3.5 h-3.5" />
          </div>
        );
      case 3:
        return (
          <div className="flex -space-x-1">
            <Tv className="w-3.5 h-3.5" />
            <Monitor className="w-3.5 h-3.5" />
            <Smartphone className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
          2
        </span>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Choose Your Devices
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-slate-500 mb-3 ml-8">
        {isFreeTrial
          ? 'Free trial includes 1 active device connection.'
          : 'Select how many devices you want to use with your subscription.'}
      </p>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {DEVICE_OPTIONS.map((option) => {
          const isSelected = selectedDevices === option.count;
          const fixedPrice = FIXED_PRICES[selectedPlan][option.count];
          const isDisabled = isFreeTrial && option.count > 1;

          return (
            <button
              type="button"
              key={option.count}
              disabled={isDisabled}
              onClick={() => onSelectDevices(option.count)}
              className={cn(
                'relative flex flex-col items-center justify-center py-3 px-2 sm:px-3 rounded-xl border text-center transition-all duration-150 outline-none select-none',
                isDisabled
                  ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400'
                  : isSelected
                  ? isFreeTrial
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20 text-emerald-950'
                    : 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-2 ring-indigo-500/20 text-indigo-950'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
              )}
            >
              <div
                className={cn(
                  'mb-1.5 p-1.5 rounded-lg transition-colors',
                  isDisabled
                    ? 'text-slate-400 bg-slate-100'
                    : isSelected
                    ? isFreeTrial
                      ? 'text-emerald-600 bg-emerald-100'
                      : 'text-indigo-600 bg-indigo-100/70'
                    : 'text-slate-500 bg-slate-100'
                )}
              >
                {getDeviceIcon(option.count)}
              </div>

              <span className="text-xs sm:text-sm font-bold block mb-0.5">
                {option.label}
              </span>

              {/* Exact Fixed Price */}
              <span
                className={cn(
                  'text-sm sm:text-base font-extrabold',
                  isDisabled
                    ? 'text-slate-400 text-xs'
                    : isSelected
                    ? isFreeTrial
                      ? 'text-emerald-700'
                      : 'text-indigo-700'
                    : 'text-slate-900'
                )}
              >
                {isDisabled ? 'Paid only' : `$${fixedPrice}`}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
