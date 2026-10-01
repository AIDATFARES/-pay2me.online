import { OrderRecord } from '@/types/order';

export interface StoredOrderLookup {
  orderId: string;
  fullName: string;
  email: string;
  planName: string;
  deviceCount: number;
  fixedPrice: number;
  paymentStatus: string;
  txid_out: string;
  webhookSecret: string;
}

/**
 * Save an order to Google Sheets via Google Apps Script Web App endpoint.
 */
export async function saveOrderToGoogleSheets(
  record: OrderRecord,
  webhookSecret?: string
): Promise<{ success: boolean; message?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      '[Google Sheets] GOOGLE_SHEETS_WEBHOOK_URL is not configured in environment variables. Order logged locally:',
      record
    );
    return { success: true, message: 'Simulated sheet save (webhook not configured)' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: record.timestamp,
        orderId: record.orderId,
        fullName: record.fullName,
        whatsappNumber: record.whatsappNumber,
        email: record.email,
        country: record.country,
        device: record.device,
        planName: record.planName,
        deviceCount: record.deviceCount,
        fixedPrice: `$${record.fixedPrice}`,
        marketingConsent: record.marketingConsent,
        paymentStatus: record.paymentStatus,
        txid_out: '',
        webhookSecret: webhookSecret || '',
      }),
      redirect: 'follow',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Google Sheets] Webhook response failed:', response.status, errorText);
      return { success: false, message: `Webhook responded with status ${response.status}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Google Sheets] Failed to send order to Google Sheets:', error);
    return { success: false, message: error.message || 'Unknown network error' };
  }
}

/**
 * Retrieve authoritative order details from Google Sheets using Order ID.
 * The webhook uses this to retrieve the true server-stored price and webhook_secret.
 */
export async function getOrderFromGoogleSheets(
  orderId: string
): Promise<{ success: boolean; found: boolean; order?: StoredOrderLookup; message?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    return { success: false, found: false, message: 'Google Sheets webhook URL not configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getOrder',
        orderId: orderId.trim(),
      }),
      redirect: 'follow',
    });

    if (!response.ok) {
      return { success: false, found: false, message: `HTTP status ${response.status}` };
    }

    const data = await response.json();
    if (data.status === 'success' && data.found && data.order) {
      return { success: true, found: true, order: data.order };
    }

    return { success: true, found: false, message: 'Order not found in spreadsheet' };
  } catch (err: any) {
    console.error('[Google Sheets] Failed to retrieve order:', err);
    return { success: false, found: false, message: err.message || 'Lookup failed' };
  }
}

/**
 * Update an order's status from Pending to Paid in Google Sheets after successful payment verification.
 * Persistently records txid_out and handles idempotent duplicates.
 */
export async function markOrderPaidInGoogleSheets(
  orderId: string,
  txid_out: string
): Promise<{ success: boolean; alreadyPaid?: boolean; message?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    return { success: false, message: 'Google Sheets webhook URL not configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'markPaid',
        orderId: orderId.trim(),
        txid_out: txid_out.trim(),
      }),
      redirect: 'follow',
    });

    if (!response.ok) {
      return { success: false, message: `HTTP status ${response.status}` };
    }

    const data = await response.json();
    if (data.status === 'success') {
      return { success: true, alreadyPaid: !!data.alreadyPaid };
    }

    return { success: false, message: data.message || 'Failed to update order status' };
  } catch (err: any) {
    console.error('[Google Sheets] Failed to mark order paid:', err);
    return { success: false, message: err.message || 'Status update failed' };
  }
}
