import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderFromGoogleSheets, markOrderPaidInGoogleSheets } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a.toLowerCase());
  const bufB = Buffer.from(b.toLowerCase());
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifySignature(
  secret: string,
  c2tTs: string,
  txidOut: string,
  valueCoin: string,
  coin: string,
  sigHeader: string
): boolean {
  if (!secret) return true;
  if (!sigHeader || !c2tTs) return false;

  // Canonical string: URL-decoded values, newline-joined, no trailing newline
  const signed = ['c2t1', c2tTs, txidOut, valueCoin, coin].join('\n');
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');

  // c2t_sig is a comma-separated list of candidates (e.g. v1=<hex>)
  const candidates = sigHeader.split(',');
  for (const candidate of candidates) {
    const parts = candidate.trim().split('=');
    if (parts.length === 2 && parts[0] === 'v1') {
      const candidateSig = parts[1].trim();
      if (safeCompare(candidateSig, expected)) {
        return true;
      }
    }
  }

  return false;
}

async function getPaidUsd(valueCoin: string, coin: string): Promise<number | null> {
  const usdStables = ['polygon_usdc', 'erc20_usdc', 'erc20_usdt', 'erc20_pyusd'];
  const numValue = parseFloat(valueCoin);
  if (isNaN(numValue) || numValue <= 0) return null;

  if (usdStables.includes(coin.toLowerCase())) {
    return numValue;
  }

  try {
    // Official CardToUSDT conversion endpoint:
    // replace every '_' in coin with '/'
    // GET https://api.cardtousdt.to/crypto/{coin}/info.php
    const path = coin.replace(/_/g, '/');
    const res = await fetch(`https://api.cardtousdt.to/crypto/${path}/info.php`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[CardToUSDT Webhook] Crypto rate endpoint failed (${res.status}) for ${coin}`);
      return null;
    }

    const info = await res.json();
    if (!info || !info.prices || info.prices.USD === undefined || info.prices.USD === null) {
      console.error(`[CardToUSDT Webhook] Missing USD rate in info response for ${coin}:`, info);
      return null;
    }

    const usdRate = parseFloat(info.prices.USD);
    if (isNaN(usdRate) || usdRate <= 0) return null;

    return numValue * usdRate;
  } catch (err) {
    console.error(`[CardToUSDT Webhook] Error fetching coin price for ${coin}:`, err);
    return null;
  }
}

async function handleWebhook(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const orderId = searchParams.get('order_id')?.trim() || '';
    const txidOut = searchParams.get('txid_out')?.trim() || '';
    const valueCoin = searchParams.get('value_coin')?.trim() || '';
    const coin = searchParams.get('coin')?.trim() || '';

    const c2tTs = searchParams.get('c2t_ts')?.trim() || req.headers.get('x-c2t-timestamp')?.trim() || '';
    const c2tSig = searchParams.get('c2t_sig')?.trim() || req.headers.get('x-c2t-signature')?.trim() || '';

    // 1. Missing payload verification
    if (!orderId || !txidOut || !valueCoin || !coin) {
      console.warn('[CardToUSDT Webhook] Missing required query parameters:', {
        orderId,
        txidOut,
        valueCoin,
        coin,
      });
      return new NextResponse('Missing required webhook parameters', { status: 400 });
    }

    // 2. Fetch authoritative order record from Google Sheets
    const lookupResult = await getOrderFromGoogleSheets(orderId);
    if (!lookupResult.success || !lookupResult.found || !lookupResult.order) {
      console.warn(`[CardToUSDT Webhook] Order ${orderId} not found in Google Sheets.`);
      return new NextResponse('Order not found', { status: 404 });
    }

    const order = lookupResult.order;

    // Security guard: Never mark Free Trial orders as paid
    if (order.paymentStatus === 'Free Trial' || order.orderId.startsWith('TRIAL-')) {
      console.warn(`[CardToUSDT Webhook] Rejected payment on Free Trial order: ${orderId}`);
      return new NextResponse('Free trial orders do not accept payments', { status: 400 });
    }

    // 3. Deduplication / Idempotency
    // If order is already Paid or txid_out already matches, respond 200 immediately
    if (order.paymentStatus === 'Paid' || (order.txid_out && order.txid_out === txidOut)) {
      console.log(`[CardToUSDT Webhook] Order ${orderId} already processed (status: ${order.paymentStatus}). Returning 200.`);
      return NextResponse.json({ status: 'success', alreadyProcessed: true, orderId }, { status: 200 });
    }

    // 4. Verify Signature (if webhook_secret was returned at checkout creation)
    if (order.webhookSecret) {
      const isSignatureValid = verifySignature(
        order.webhookSecret,
        c2tTs,
        txidOut,
        valueCoin,
        coin,
        c2tSig
      );

      if (!isSignatureValid) {
        console.warn(`[CardToUSDT Webhook] Invalid signature for order ${orderId}`);
        return new NextResponse('Invalid signature', {
          status: !c2tTs || !c2tSig ? 400 : 403,
        });
      }

      // Check 300-second timestamp freshness window
      if (c2tTs) {
        const tsNum = parseInt(c2tTs, 10);
        const nowSec = Math.floor(Date.now() / 1000);
        if (!isNaN(tsNum) && Math.abs(nowSec - tsNum) > 300) {
          console.warn(`[CardToUSDT Webhook] Stale timestamp for order ${orderId}: ${c2tTs}`);
          return NextResponse.json({ status: 'held', reason: 'stale_timestamp' }, { status: 200 });
        }
      }
    }

    // 5. Verify authoritative payment amount against stored fixed price
    const expectedUsd = order.fixedPrice;
    const paidUsdAmount = await getPaidUsd(valueCoin, coin);
    const band = 0.80; // 80% tolerance band recommended by CardToUSDT

    if (paidUsdAmount !== null && paidUsdAmount >= expectedUsd * band) {
      // Mark order as Paid persistently and idempotently in Google Sheets
      const updateResult = await markOrderPaidInGoogleSheets(orderId, txidOut);
      if (!updateResult.success) {
        console.error(`[CardToUSDT Webhook] Failed to update Google Sheets status for ${orderId}:`, updateResult.message);
      } else {
        console.log(`[CardToUSDT Webhook] Order ${orderId} marked Paid ($${paidUsdAmount} USD settled).`);
      }

      return NextResponse.json(
        { status: 'success', orderId, paymentStatus: 'Paid' },
        { status: 200 }
      );
    }

    // If paid amount is below 80% band or unpriced, hold for admin review
    console.warn(
      `[CardToUSDT Webhook] Order ${orderId} held for review: paid ${paidUsdAmount} USD vs expected ${expectedUsd} USD`
    );
    return NextResponse.json(
      { status: 'held', reason: 'below_band_or_unpriced', paidUsd: paidUsdAmount, expectedUsd },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[CardToUSDT Webhook] Unexpected webhook error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleWebhook(req);
}

export async function POST(req: NextRequest) {
  return handleWebhook(req);
}
