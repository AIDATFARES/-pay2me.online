export type SubscriptionPlanId = 'free_trial' | '1_month' | '3_months' | '6_months' | '12_months';
export type DeviceCount = 1 | 2 | 3;
export type PaymentMethodId = 'card' | 'paypal' | 'bank_transfer' | 'cash_app';

export interface PlanOption {
  id: SubscriptionPlanId;
  name: string;
  durationMonths: number;
  durationLabel?: string;
  badge?: string;
  isFree?: boolean;
  benefits: string[];
}

export interface CustomerInfo {
  fullName: string;
  whatsappNumber: string;
  email: string;
  country: string;
  device: string;
  marketingConsent: boolean;
  termsAgreed?: boolean;
}

export interface OrderPayload {
  planId: SubscriptionPlanId;
  deviceCount: DeviceCount;
  customer: CustomerInfo;
  paymentMethod?: PaymentMethodId;
  methodAgreed?: boolean;
}

export interface OrderRecord {
  orderId: string;
  timestamp: string;
  fullName: string;
  whatsappNumber: string;
  email: string;
  country: string;
  device: string;
  planName: string;
  deviceCount: number;
  fixedPrice: number;
  marketingConsent: 'Yes' | 'No';
  paymentStatus: string;
  paymentMethod?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  checkoutUrl?: string;
  paymentMethod?: PaymentMethodId;
  error?: string;
  details?: Record<string, string>;
}
