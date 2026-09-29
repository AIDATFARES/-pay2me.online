export type SubscriptionPlanId = 'free_trial' | '1_month' | '3_months' | '6_months' | '12_months';
export type DeviceCount = 1 | 2 | 3;

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
}

export interface OrderPayload {
  planId: SubscriptionPlanId;
  deviceCount: DeviceCount;
  customer: CustomerInfo;
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
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Free Trial';
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  checkoutUrl?: string;
  error?: string;
  details?: Record<string, string>;
}
