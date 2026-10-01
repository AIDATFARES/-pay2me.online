'use client';

import React, { useState, useEffect } from 'react';
import { CustomerInfo, DeviceCount, PaymentMethodId, SubscriptionPlanId } from '@/types/order';
import { PlanSelector } from './PlanSelector';
import { DeviceSelector } from './DeviceSelector';
import { CustomerForm } from './CustomerForm';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { OrderSummary } from './OrderSummary';
import { Gift, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const OrderForm: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('12_months');
  const [selectedDevices, setSelectedDevices] = useState<DeviceCount>(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('card');

  // Interactive Checkbox Agreements
  const [methodAgreed, setMethodAgreed] = useState<boolean>(false);
  const [methodError, setMethodError] = useState<string | null>(null);

  const [trialAgreed, setTrialAgreed] = useState<boolean>(false);
  const [trialError, setTrialError] = useState<string | null>(null);
  const [showTrialDetails, setShowTrialDetails] = useState<boolean>(false);

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    whatsappNumber: '',
    email: '',
    country: '',
    device: '',
    marketingConsent: false,
    termsAgreed: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Ensure isSubmitting is never locked when navigating back via browser back or cache
  useEffect(() => {
    setIsSubmitting(false);

    const handlePageShow = (e: PageTransitionEvent) => {
      setIsSubmitting(false);
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlanId) => {
    setSelectedPlan(plan);
    setMethodAgreed(false);
    setMethodError(null);
    setTrialAgreed(false);
    setTrialError(null);
    setShowTrialDetails(false);

    if (plan === 'free_trial') {
      setSelectedDevices(1);
    }
  };

  const handleFieldChange = (field: keyof CustomerInfo, value: string | boolean) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};
    let hasCheckboxError = false;

    if (!customer.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (customer.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!customer.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'Please enter your WhatsApp phone number.';
    } else if (customer.whatsappNumber.replace(/[^0-9]/g, '').length < 6) {
      newErrors.whatsappNumber = 'Please enter a valid phone number with country code.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(customer.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!customer.country) {
      newErrors.country = 'Please select your country.';
    }

    if (!customer.device) {
      newErrors.device = 'Please select the device you will use.';
    }

    // MANDATORY CHECKBOX: Payment Method Agreement (or Free Trial Agreement)
    if (selectedPlan !== 'free_trial') {
      if (!methodAgreed) {
        if (selectedMethod === 'card') {
          setMethodError('Card and Cash App payments require identity verification. You must click this checkbox confirming that you agree to complete identity verification.');
        } else {
          setMethodError('You must click this checkbox confirming that you have read and agreed to this payment step.');
        }
        hasCheckboxError = true;
      } else {
        setMethodError(null);
      }
    } else {
      if (!trialAgreed) {
        setTrialError('You must click this checkbox confirming that you agree to take and send a screenshot of the invoice on WhatsApp.');
        hasCheckboxError = true;
      } else {
        setTrialError(null);
      }
    }

    setErrors(newErrors);

    const hasFieldErrors = Object.keys(newErrors).length > 0;
    if (hasCheckboxError) {
      setApiError('Please ensure each required confirmation checkbox has been clicked and agreed to.');
    }

    return !hasFieldErrors && !hasCheckboxError;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setApiError(null);

    const isValid = validate();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          deviceCount: selectedDevices,
          customer,
          paymentMethod: selectedPlan === 'free_trial' ? undefined : selectedMethod,
          methodAgreed: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setApiError(data.error || 'Unable to initialize checkout. Please check your details and try again.');
        setIsSubmitting(false);
        return;
      }

      // Query params for the rich invoice confirmation page
      const invoiceParams = new URLSearchParams({
        orderId: data.orderId || '',
        method: selectedPlan === 'free_trial' ? 'trial' : (data.paymentMethod || selectedMethod),
        plan: selectedPlan,
        devices: String(selectedDevices),
        price: String(data.fixedPrice ?? 0),
        name: customer.fullName.trim(),
        email: customer.email.trim(),
        phone: customer.whatsappNumber.trim(),
        country: customer.country,
        device: customer.device,
      });

      if (data.isTrial || selectedPlan === 'free_trial') {
        // Free trial: navigate directly to confirmation screen
        invoiceParams.set('type', 'trial');
        window.location.href = `/confirmation?${invoiceParams.toString()}`;
        setTimeout(() => setIsSubmitting(false), 2500);
      } else if (data.paymentMethod === 'card' && data.checkoutUrl) {
        // Paid CardToUSDT order: open hosted checkout in a new tab
        window.open(data.checkoutUrl, '_blank');
        invoiceParams.set('checkoutUrl', data.checkoutUrl);
        window.location.href = `/confirmation?${invoiceParams.toString()}`;
        setTimeout(() => setIsSubmitting(false), 2500);
      } else {
        // PayPal / Bank Transfer / Cash App: direct to invoice page with WhatsApp screenshot instructions
        window.location.href = `/confirmation?${invoiceParams.toString()}`;
        setTimeout(() => setIsSubmitting(false), 2500);
      }
    } catch (err: any) {
      console.error('Order submission network error:', err);
      setApiError('Network connection issue. Please check your internet connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl shadow-indigo-950/[0.04] p-5 sm:p-7 md:p-8">
      {/* Step 1: Plan Selector */}
      <PlanSelector
        selectedPlan={selectedPlan}
        onSelectPlan={handleSelectPlan}
      />

      {/* Step 2: Device Selector */}
      <DeviceSelector
        selectedPlan={selectedPlan}
        selectedDevices={selectedDevices}
        onSelectDevices={(devices) => setSelectedDevices(devices)}
      />

      {/* Step 3: Customer Information */}
      <CustomerForm
        formData={customer}
        errors={errors}
        onChange={handleFieldChange}
      />

      {/* Step 4: Payment Method Selector (Only for paid plans) */}
      <PaymentMethodSelector
        selectedPlan={selectedPlan}
        selectedMethod={selectedMethod}
        onSelectMethod={(method) => setSelectedMethod(method)}
        isAgreed={methodAgreed}
        onToggleAgreement={(agreed) => {
          setMethodAgreed(agreed);
          if (agreed) setMethodError(null);
        }}
        error={methodError}
      />

      {/* Free Trial Mandatory Confirmation Checkbox (Compact: reveals details on click) */}
      {selectedPlan === 'free_trial' && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowTrialDetails((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if ((e.target as HTMLElement).tagName !== 'INPUT') {
                e.preventDefault();
                setShowTrialDetails((prev) => !prev);
              }
            }
          }}
          className={cn(
            'mb-6 p-3 sm:p-3.5 rounded-xl border transition-all duration-200 select-none cursor-pointer outline-none',
            trialError
              ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-200 text-rose-950'
              : trialAgreed
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 hover:border-amber-300 text-amber-950'
          )}
        >
          {/* Compact Header: Checkbox, Title & Expand Indicator */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center"
              >
                <input
                  type="checkbox"
                  id="trial-agreed-input"
                  checked={trialAgreed}
                  onChange={(e) => {
                    setTrialAgreed(e.target.checked);
                    if (e.target.checked) setTrialError(null);
                  }}
                  className="w-4 h-4 rounded border-amber-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                />
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 truncate">
                <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Free Trial & Screenshot Confirmation</span>
                <span className="text-rose-500 shrink-0">*</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
                {showTrialDetails ? 'Hide' : 'Details'}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200 text-slate-400',
                  showTrialDetails && 'rotate-180 text-emerald-600'
                )}
              />
            </div>
          </div>

          {/* Revealed Details: hidden initially, shown only when clicked */}
          {showTrialDetails && (
            <div
              className={cn(
                'mt-2.5 pt-2.5 border-t text-xs text-slate-700 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200 pl-6 sm:pl-7',
                trialAgreed ? 'border-emerald-200/80' : 'border-amber-200/80'
              )}
            >
              I confirm that I have read this and agree that this is a free trial limited to 1 connection. I agree to <strong className="text-slate-900 font-semibold">take a screenshot of the invoice and send it to the seller on WhatsApp</strong> to confirm my free trial request and receive line activation.
            </div>
          )}

          {trialError && (
            <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1 pl-6 sm:pl-7">
              <span>⚠️</span> {trialError}
            </p>
          )}
        </div>
      )}

      {/* Order Summary & Submit */}
      <OrderSummary
        selectedPlan={selectedPlan}
        selectedDevices={selectedDevices}
        selectedPaymentMethod={selectedMethod}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        apiError={apiError}
      />
    </div>
  );
};
