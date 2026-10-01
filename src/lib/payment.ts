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
  webhookSecret?: string;
  amountUsd?: number;
  error?: string;
}

/**
 * Creates CardToUSDT Checkout Session according to official docs:
 * POST https://api.cardtousdt.to/v2/checkout
 *
 * Requirements:
 * - No API key
 * - No library
 * - Authoritative server-side fixed price lookup
 * - Public HTTPS webhook URL contains only the dynamic order_id
 */
export async function createCardToUsdtCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
  const { orderId, planId, deviceCount, customer } = params;

  // 1. Strictly look up the fixed price from the server-side price table
  const price = getFixedPrice(planId, deviceCount);

  // 2. Public HTTPS Webhook URL (CardToUSDT requires a public HTTPS hostname, never localhost)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pay2me.online').replace(/\/+$/, '');
  const webhookUrl = `${siteUrl}/api/cardtousdt/webhook?order_id=${encodeURIComponent(orderId)}`;

  const payoutAddress = (
    process.env.CARDTOUSDT_PAYOUT_ADDRESS || '0x9e1d2897A1afD31908d88cBAdFE4eD6300c8a27D'
  ).trim();
  const checkoutApiUrl = 'https://api.cardtousdt.to/v2/checkout';

  // 3. Verify payout wallet is configured and is a valid 42-char EVM address (0x...)
  const isValidAddress = !!payoutAddress && /^0x[a-fA-F0-9]{40}$/.test(payoutAddress);

  if (!isValidAddress) {
    const errorMsg = !payoutAddress
      ? 'CardToUSDT payout address is not configured. Please add your EVM wallet address to CARDTOUSDT_PAYOUT_ADDRESS in .env.local to enable payment checkout.'
      : 'Invalid CARDTOUSDT_PAYOUT_ADDRESS. It must be a valid 42-character EVM address starting with 0x (e.g. 0x...).';
    console.error(`[CardToUSDT] ${errorMsg}`);
    return {
      success: false,
      checkoutUrl: '',
      price,
      error: errorMsg,
    };
  }

  try {
    const response = await fetch(checkoutApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payout_address: payoutAddress,
        amount: price,
        currency: 'USD',
        buyer_email: customer.email,
        order_id: orderId,
        webhook_url: webhookUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[CardToUSDT] API error response:', response.status, errorData);
      let errorMsg = `CardToUSDT error (HTTP ${response.status})`;
      try {
        const errObj = JSON.parse(errorData);
        if (errObj.error?.message) {
          errorMsg = `Payment gateway error: ${errObj.error.message}`;
        }
      } catch (_) {}

      return {
        success: false,
        checkoutUrl: '',
        price,
        error: errorMsg,
      };
    }

    const data = await response.json();
    const checkoutUrl = data.checkout_url;

    if (!checkoutUrl) {
      console.error('[CardToUSDT] Missing checkout_url in API response:', data);
      return {
        success: false,
        checkoutUrl: '',
        price,
        error: 'CardToUSDT did not return a valid checkout URL.',
      };
    }

    return {
      success: true,
      checkoutUrl,
      price,
      webhookSecret: data.webhook_secret || undefined,
      amountUsd: typeof data.amount_usd === 'number' ? data.amount_usd : price,
    };
  } catch (err: any) {
    console.error('[CardToUSDT] Network request failed:', err);
    return {
      success: false,
      checkoutUrl: '',
      price,
      error: err.message || 'Failed to connect to CardToUSDT payment gateway.',
    };
  }
}
