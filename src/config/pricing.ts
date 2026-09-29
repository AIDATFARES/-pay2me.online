import { SubscriptionPlanId, DeviceCount, PlanOption } from '@/types/order';

/**
 * FIXED PRICE TABLE
 *
 * CRITICAL RULE:
 * Prices are strictly PREDEFINED fixed values.
 * No formulas (e.g. price * devices, discounts, etc.) are allowed.
 */
export const FIXED_PRICES: Record<SubscriptionPlanId, Record<DeviceCount, number>> = {
  'free_trial': {
    1: 0,
    2: 0,
    3: 0,
  },
  '1_month': {
    1: 15,
    2: 29,
    3: 44,
  },
  '3_months': {
    1: 35,
    2: 68,
    3: 102,
  },
  '6_months': {
    1: 50,
    2: 98,
    3: 145,
  },
  '12_months': {
    1: 70,
    2: 137,
    3: 203,
  },
};

/**
 * Get fixed price directly from lookup table
 */
export function getFixedPrice(planId: SubscriptionPlanId, deviceCount: DeviceCount): number {
  const planPrices = FIXED_PRICES[planId];
  if (!planPrices) {
    throw new Error(`Invalid plan: ${planId}`);
  }
  const price = planPrices[deviceCount];
  if (price === undefined) {
    throw new Error(`Invalid device count: ${deviceCount} for plan: ${planId}`);
  }
  return price;
}

export const PLAN_BENEFITS = [
  'Premium HD / 4K Quality',
  'Advanced EPG & Catch-up',
  'Premium Anti-Freeze Technology',
  '24/7 Customer Support',
  'Instant Activation',
];

export const SUBSCRIPTION_PLANS: PlanOption[] = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    durationMonths: 0,
    durationLabel: 'Free Access',
    badge: '100% Free',
    isFree: true,
    benefits: [
      'Full Premium Access',
      'Premium HD / 4K Quality',
      'Advanced EPG & Catch-up',
      'Instant Activation',
      'No Credit Card Required',
    ],
  },
  {
    id: '1_month',
    name: '1 Month',
    durationMonths: 1,
    benefits: PLAN_BENEFITS,
  },
  {
    id: '3_months',
    name: '3 Months',
    durationMonths: 3,
    benefits: PLAN_BENEFITS,
  },
  {
    id: '6_months',
    name: '6 Months',
    durationMonths: 6,
    benefits: PLAN_BENEFITS,
  },
  {
    id: '12_months',
    name: '12 Months',
    durationMonths: 12,
    badge: 'Best Value',
    benefits: PLAN_BENEFITS,
  },
];

export const DEVICE_OPTIONS: { count: DeviceCount; label: string }[] = [
  { count: 1, label: '1 Device' },
  { count: 2, label: '2 Devices' },
  { count: 3, label: '3 Devices' },
];

export const SUPPORTED_DEVICES: string[] = [
  'Samsung Smart TV',
  'LG Smart TV',
  'Android TV',
  'Fire TV / Firestick',
  'Android Phone',
  'iPhone / iPad',
  'Apple TV',
  'MAG / TV Box',
  'Windows',
  'Other',
];

export const COUNTRIES: { code: string; name: string }[] = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'OM', name: 'Oman' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AT', name: 'Austria' },
  { code: 'GR', name: 'Greece' },
  { code: 'TR', name: 'Turkey' },
  { code: 'MA', name: 'Morocco' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'OTHER', name: 'Other Country' },
];
