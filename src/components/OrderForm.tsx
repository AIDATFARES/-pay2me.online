'use client';

import React, { useState } from 'react';
import { CustomerInfo, DeviceCount, SubscriptionPlanId } from '@/types/order';
import { PlanSelector } from './PlanSelector';
import { DeviceSelector } from './DeviceSelector';
import { CustomerForm } from './CustomerForm';
import { OrderSummary } from './OrderSummary';

export const OrderForm: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('12_months');
  const [selectedDevices, setSelectedDevices] = useState<DeviceCount>(1);

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    whatsappNumber: '',
    email: '',
    country: '',
    device: '',
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSelectPlan = (plan: SubscriptionPlanId) => {
    setSelectedPlan(plan);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setApiError(data.error || 'Unable to initialize checkout. Please check your details and try again.');
        setIsSubmitting(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        window.location.href = `/confirmation?orderId=${encodeURIComponent(data.orderId || '')}`;
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

      {/* Order Summary & Submit */}
      <OrderSummary
        selectedPlan={selectedPlan}
        selectedDevices={selectedDevices}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        apiError={apiError}
      />
    </div>
  );
};

