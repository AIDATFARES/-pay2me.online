import { NextRequest, NextResponse } from 'next/server';
import { FIXED_PRICES, getFixedPrice, SUBSCRIPTION_PLANS } from '@/config/pricing';
import { saveOrderToGoogleSheets } from '@/lib/sheets';
import { createCardToUsdtCheckout } from '@/lib/payment';
import { DeviceCount, OrderPayload, OrderRecord, SubscriptionPlanId } from '@/types/order';

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

    const { planId, deviceCount, customer } = body;

    // Validate planId (now supports free_trial)
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

    // STRICT SECURITY: Retrieve fixed price from server-side price table
    const fixedPrice = getFixedPrice(planId, deviceCount);
    const isFree = fixedPrice === 0;
    const orderId = generateOrderId(isFree);
    const timestamp = new Date().toISOString();

    const planObj = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    const planName = planObj ? planObj.name : planId;

    // Structured row for Google Sheets
    const orderRecord: OrderRecord = {
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
      paymentStatus: isFree ? 'Free Trial' : 'Pending',
    };

    // Save to Google Sheets asynchronously
    saveOrderToGoogleSheets(orderRecord).catch((err) => {
      console.error('[API Order] Google Sheets background sync error:', err);
    });

    // Determine host base URL for payment callbacks
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // For Free Trial ($0), bypass payment processor and redirect directly to confirmation
    if (isFree) {
      return NextResponse.json({
        success: true,
        orderId,
        fixedPrice: 0,
        checkoutUrl: `${baseUrl}/confirmation?orderId=${encodeURIComponent(orderId)}&type=trial`,
      });
    }

    // For paid subscriptions, create CardToUSDT checkout session using server-validated fixed price
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

    return NextResponse.json({
      success: true,
      orderId,
      fixedPrice,
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
