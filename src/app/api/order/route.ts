import { NextRequest, NextResponse } from 'next/server';
import { getFixedPrice, SUBSCRIPTION_PLANS } from '@/config/pricing';
import { saveOrderToGoogleSheets } from '@/lib/sheets';
import { createCardToUsdtCheckout } from '@/lib/payment';
import { DeviceCount, OrderPayload, OrderRecord, PaymentMethodId, SubscriptionPlanId } from '@/types/order';

export const dynamic = 'force-dynamic';

function generateOrderId(isFree: boolean): string {
  const prefix = isFree ? 'TRIAL' : 'IPTV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<OrderPayload> = await req.json();

    const { planId, deviceCount, customer, paymentMethod = 'card' } = body;

    // Validate planId
    const validPlans: SubscriptionPlanId[] = ['free_trial', '1_month', '3_months', '6_months', '12_months'];
    if (!planId || !validPlans.includes(planId)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid subscription plan.' },
        { status: 400 }
      );
    }

    // Validate deviceCount
    const validDevices: DeviceCount[] = [1, 2, 3];
    if (!deviceCount || !validDevices.includes(deviceCount)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid device count (1, 2, or 3).' },
        { status: 400 }
      );
    }

    // Validate customer fields
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer information is missing.' },
        { status: 400 }
      );
    }

    const { fullName, whatsappNumber, email, country, device, marketingConsent } = customer;

    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide your full name.' },
        { status: 400 }
      );
    }

    if (!whatsappNumber || whatsappNumber.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid WhatsApp number.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!country || country.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select your country.' },
        { status: 400 }
      );
    }

    if (!device || device.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select your device.' },
        { status: 400 }
      );
    }

    // Validate paymentMethod
    const validMethods: PaymentMethodId[] = ['card', 'paypal', 'bank_transfer', 'cash_app'];
    const selectedMethod: PaymentMethodId = validMethods.includes(paymentMethod as PaymentMethodId)
      ? (paymentMethod as PaymentMethodId)
      : 'card';

    // STRICT SECURITY: Authoritative price determined solely by server-side table
    const fixedPrice = getFixedPrice(planId, deviceCount);
    const isFree = fixedPrice === 0 || planId === 'free_trial';
    const orderId = generateOrderId(isFree);
    const timestamp = new Date().toISOString();

    const planObj = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    const planName = planObj ? planObj.name : planId;

    // Determine host base URL for payment callbacks and redirects
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host') || 'www.pay2me.online';
    const baseUrl = `${protocol}://${host}`;

    // ==========================================
    // FLOW 1: FREE TRIAL (Completely separate from payments)
    // ==========================================
    if (isFree) {
      const trialRecord: OrderRecord = {
        orderId,
        timestamp,
        fullName: fullName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim().toLowerCase(),
        country: country.trim(),
        device: device.trim(),
        planName: 'Free Trial',
        deviceCount: 1,
        fixedPrice: 0,
        marketingConsent: marketingConsent ? 'Yes' : 'No',
        paymentStatus: 'Free Trial',
        paymentMethod: 'free_trial',
      };

      // Save to Google Sheets with Free Trial status (for manual admin fulfillment)
      try {
        await saveOrderToGoogleSheets(trialRecord);
        console.log('[API Order] Free Trial recorded in Google Sheets:', orderId);
      } catch (err) {
        console.error('[API Order] Failed to record Free Trial to Google Sheets:', err);
      }

      // Bypass payment gateways and return confirmation URL
      return NextResponse.json({
        success: true,
        orderId,
        fixedPrice: 0,
        isTrial: true,
        paymentMethod: 'free_trial',
        checkoutUrl: `${baseUrl}/confirmation?orderId=${encodeURIComponent(orderId)}&type=trial`,
      });
    }

    // ==========================================
    // FLOW 2: WHATSAPP-BASED PAYMENT METHODS (PayPal, Bank Transfer, Cash App)
    // ==========================================
    if (selectedMethod !== 'card') {
      const methodLabels: Record<PaymentMethodId, string> = {
        paypal: 'PayPal',
        bank_transfer: 'Bank Transfer',
        cash_app: 'Cash App',
        card: 'Card',
      };
      const label = methodLabels[selectedMethod];

      const manualOrderRecord: OrderRecord = {
        orderId,
        timestamp,
        fullName: fullName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim().toLowerCase(),
        country: country.trim(),
        device: device.trim(),
        planName,
        deviceCount,
        fixedPrice,
        marketingConsent: marketingConsent ? 'Yes' : 'No',
        paymentStatus: `Pending (${label})`,
        paymentMethod: selectedMethod,
      };

      // Save to Google Sheets with Pending (Method) status
      try {
        await saveOrderToGoogleSheets(manualOrderRecord);
        console.log(`[API Order] Order saved in Google Sheets with status Pending (${label}):`, orderId);
      } catch (err) {
        console.error('[API Order] Failed to record manual order to Google Sheets:', err);
      }

      return NextResponse.json({
        success: true,
        orderId,
        fixedPrice,
        isTrial: false,
        paymentMethod: selectedMethod,
        checkoutUrl: null,
      });
    }

    // ==========================================
    // FLOW 3: AUTOMATED CARD / CRYPTO (CardToUSDT hosted checkout)
    // ==========================================
    const checkoutResult = await createCardToUsdtCheckout({
      orderId,
      planId,
      deviceCount,
      customer: {
        fullName: fullName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim().toLowerCase(),
        country: country.trim(),
        device: device.trim(),
        marketingConsent: !!marketingConsent,
      },
      baseUrl,
    });

    if (!checkoutResult.success || !checkoutResult.checkoutUrl) {
      return NextResponse.json(
        {
          success: false,
          error: checkoutResult.error || 'Unable to create payment session. Please try again.',
        },
        { status: 502 }
      );
    }

    // Structured initial record for Google Sheets with Pending status
    const paidOrderRecord: OrderRecord = {
      orderId,
      timestamp,
      fullName: fullName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: email.trim().toLowerCase(),
      country: country.trim(),
      device: device.trim(),
      planName,
      deviceCount,
      fixedPrice,
      marketingConsent: marketingConsent ? 'Yes' : 'No',
      paymentStatus: 'Pending',
      paymentMethod: 'card',
    };

    // Save to Google Sheets as Pending (and store webhook_secret if returned by CardToUSDT)
    try {
      await saveOrderToGoogleSheets(paidOrderRecord, checkoutResult.webhookSecret);
      console.log('[API Order] Paid card order saved as Pending in Google Sheets:', orderId);
    } catch (err) {
      console.error('[API Order] Failed to record paid order to Google Sheets:', err);
    }

    return NextResponse.json({
      success: true,
      orderId,
      fixedPrice,
      isTrial: false,
      paymentMethod: 'card',
      checkoutUrl: checkoutResult.checkoutUrl,
    });
  } catch (error: any) {
    console.error('[API Order] Unexpected order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing your order. Please try again.' },
      { status: 500 }
    );
  }
}
