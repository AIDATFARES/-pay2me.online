import { getFixedPrice } from '@/config/pricing';
import { SubscriptionPlanId, DeviceCount, OrderPayload } from '@/types/order';

interface CreateCheckoutParams {
  orderId: string;
  planId: SubscriptionPlanId;
  deviceCount: DeviceCount;
  customer: OrderPayload['customer'];
  baseUrl: string;
}

interface CheckoutResult {
  success: boolean;
  checkoutUrl: string;
  price: number;
  error?: string;
}

/**
 * Creates CardToUSDT Checkout Session securely from backend.
 * Uses strict server-side price lookup (never trusts client price).
 */
export async function createCardToUsdtCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
  const { orderId, planId, deviceCount, customer, baseUrl } = params;

  // 1. Strictly look up the fixed price from the server-side price table
  const price = getFixedPrice(planId, deviceCount);

  const apiKey = process.env.CARDTOUSDT_API_KEY;
  const apiUrl = process.env.CARDTOUSDT_API_URL || 'https://api.cardtousdt.com/v1/checkout';
  const merchantId = process.env.CARDTOUSDT_MERCHANT_ID;

  // Plan display name
  const planNames: Record<SubscriptionPlanId, string> = {
    'free_trial': 'Free Trial',
    '1_month': '1 Month IPTV Subscription',
    '3_months': '3 Months IPTV Subscription',
    '6_months': '6 Months IPTV Subscription',
    '12_months': '12 Months IPTV Subscription',
  };
  const title = `${planNames[planId]} (${deviceCount} ${deviceCount === 1 ? 'Device' : 'Devices'})`;

  // Success / return URL (Opaque confirmation page)
  const returnUrl = `${baseUrl}/confirmation?orderId=${encodeURIComponent(orderId)}`;

  // If live CardToUSDT API credentials are configured, call the CardToUSDT API
  if (apiKey) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(merchantId ? { 'X-Merchant-ID': merchantId } : {}),
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: price,
          currency: 'USD',
          title: title,
          customer_email: customer.email,
          customer_name: customer.fullName,
          customer_phone: customer.whatsappNumber,
          success_url: returnUrl,
          cancel_url: returnUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[CardToUSDT] API error response:', response.status, errorData);
        return {
          success: true,
          checkoutUrl: returnUrl,
          price,
          error: `CardToUSDT returned status ${response.status}`,
        };
      }

      const data = await response.json();
      const checkoutUrl = data.checkout_url || data.payment_url || data.url || data.data?.checkout_url;

      if (checkoutUrl) {
        return {
          success: true,
          checkoutUrl,
          price,
        };
      }

      return {
        success: true,
        checkoutUrl: returnUrl,
        price,
      };
    } catch (err: any) {
      console.error('[CardToUSDT] Request failed:', err);
      return {
        success: true,
        checkoutUrl: returnUrl,
        price,
        error: err.message,
      };
    }
  }

  // Fallback mode when CARDTOUSDT_API_KEY is not yet populated in .env.local
  return {
    success: true,
    checkoutUrl: returnUrl,
    price,
  };
}

