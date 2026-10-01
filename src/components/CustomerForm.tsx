import React from 'react';
import { CustomerInfo } from '@/types/order';
import { COUNTRIES, SUPPORTED_DEVICES } from '@/config/pricing';
import { User, Phone, Mail, Globe, Tv2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerFormProps {
  formData: CustomerInfo;
  errors: Partial<Record<keyof CustomerInfo, string>>;
  onChange: (field: keyof CustomerInfo, value: string | boolean) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  formData,
  errors,
  onChange,
}) => {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
          3
        </span>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Customer Information
        </h2>
      </div>

      <div className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="fullName"
              autoComplete="name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/50 rounded-lg border transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? 'border-rose-400 focus:ring-rose-200 text-slate-900'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* WhatsApp & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                name="whatsappNumber"
                autoComplete="tel"
                placeholder="+1 234 567 8900"
                value={formData.whatsappNumber}
                onChange={(e) => onChange('whatsappNumber', e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/50 rounded-lg border transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.whatsappNumber
                    ? 'border-rose-400 focus:ring-rose-200 text-slate-900'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
                }`}
              />
            </div>
            {errors.whatsappNumber && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.whatsappNumber}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/50 rounded-lg border transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-rose-400 focus:ring-rose-200 text-slate-900'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Country & Device */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Country */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Country <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <select
                name="country"
                value={formData.country}
                onChange={(e) => onChange('country', e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/50 rounded-lg border transition-colors focus:bg-white focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                  errors.country
                    ? 'border-rose-400 focus:ring-rose-200 text-slate-900'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
                }`}
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.country && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.country}</p>
            )}
          </div>

          {/* Device */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Device <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Tv2 className="w-4 h-4" />
              </div>
              <select
                name="device"
                value={formData.device}
                onChange={(e) => onChange('device', e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/50 rounded-lg border transition-colors focus:bg-white focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                  errors.device
                    ? 'border-rose-400 focus:ring-rose-200 text-slate-900'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
                }`}
              >
                <option value="">Select your device</option>
                {SUPPORTED_DEVICES.map((dev) => (
                  <option key={dev} value={dev}>
                    {dev}
                  </option>
                ))}
              </select>
            </div>
            {errors.device && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.device}</p>
            )}
          </div>
        </div>

        {/* Mandatory Terms & Conditions Agreement Checkbox */}
        <div className="pt-2">
          <label
            className={cn(
              'flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none',
              errors.termsAgreed
                ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-200 text-rose-950'
                : formData.termsAgreed
                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60 text-slate-800'
            )}
          >
            <input
              type="checkbox"
              name="termsAgreed"
              checked={!!formData.termsAgreed}
              onChange={(e) => onChange('termsAgreed', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
            />
            <div className="text-xs leading-relaxed flex-1">
              <span className="font-bold text-slate-900 block mb-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Service Agreement & Terms Confirmation <span className="text-rose-500">*</span>
              </span>
              <span>
                I confirm that I have read and agree to the <strong>Terms of Service</strong>, subscription policies, and order details.
              </span>
            </div>
          </label>
          {errors.termsAgreed && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium pl-1 flex items-center gap-1">
              <span>⚠️</span> {errors.termsAgreed}
            </p>
          )}
        </div>

      </div>
    </section>
  );
};
