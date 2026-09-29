import { OrderRecord } from '@/types/order';

/**
 * Save an order to Google Sheets via Google Apps Script Web App endpoint.
 * Credentials and webhook URLs are strictly kept server-side.
 */
export async function saveOrderToGoogleSheets(record: OrderRecord): Promise<{ success: boolean; message?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      '[Google Sheets] GOOGLE_SHEETS_WEBHOOK_URL is not configured in environment variables. Order logged locally:',
      record
    );
    // Return gracefully so the checkout flow does not fail in development or until the user sets the URL
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
      }),
      // Apps Script sometimes redirects (302) to an execution page; follow redirects
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

