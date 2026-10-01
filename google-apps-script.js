/**
 * Google Apps Script for IPTV Order Google Sheets Integration
 *
 * HOW TO SET UP / UPDATE:
 * 1. Open your Google Sheet
 * 2. Create/verify the first row with these header titles:
 *    [Timestamp, Order ID, Full Name, WhatsApp Number, Email, Country, Device, Subscription Plan, Devices, Fixed Price, Marketing Consent, Payment Status, TxID, Webhook Secret]
 * 3. Go to "Extensions" -> "Apps Script"
 * 4. Paste this entire code into Code.gs
 * 5. Click "Deploy" -> "Manage deployments" -> Click Edit (pencil icon) -> Version: "New version" -> Click "Deploy"
 * 6. The Web App URL stays the same or copy the updated URL into your environment variables as GOOGLE_SHEETS_WEBHOOK_URL
 */

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Write to tab named 'Orders', or 'Sheet1', or fallback to the very first tab
    const sheet = ss.getSheetByName('Orders') || ss.getSheetByName('Sheet1') || ss.getSheets()[0];
    const data = JSON.parse(e.postData.contents);

    // 1. GET ORDER ACTION (Authoritative order lookup for webhook verification)
    if (data.action === 'getOrder') {
      const orderIdToFind = String(data.orderId || '').trim();
      const rows = sheet.getDataRange().getValues();

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (String(row[1]).trim() === orderIdToFind) {
          const rawPrice = String(row[9] || '0').replace(/[^0-9.]/g, '');
          return ContentService.createTextOutput(
            JSON.stringify({
              status: 'success',
              found: true,
              order: {
                orderId: row[1],
                fullName: row[2],
                email: row[4],
                planName: row[7],
                deviceCount: row[8],
                fixedPrice: parseFloat(rawPrice) || 0,
                paymentStatus: row[11],
                txid_out: row[12] ? String(row[12]) : '',
                webhookSecret: row[13] ? String(row[13]) : ''
              }
            })
          ).setMimeType(ContentService.MimeType.JSON);
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({ status: 'not_found', found: false, orderId: orderIdToFind })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. MARK PAID ACTION (Persistent, idempotent status update)
    if (data.action === 'markPaid') {
      const orderIdToFind = String(data.orderId || '').trim();
      const rows = sheet.getDataRange().getValues();

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (String(row[1]).trim() === orderIdToFind) {
          const currentStatus = String(row[11] || '').trim();
          const existingTxid = row[12] ? String(row[12]).trim() : '';

          // Idempotency: If already paid or already has this txid, return success without duplicate work
          if (currentStatus === 'Paid' || (data.txid_out && existingTxid === String(data.txid_out).trim())) {
            return ContentService.createTextOutput(
              JSON.stringify({ status: 'success', alreadyPaid: true, orderId: orderIdToFind })
            ).setMimeType(ContentService.MimeType.JSON);
          }

          // Update Payment Status (Column 12 / L) to Paid
          sheet.getRange(i + 1, 12).setValue('Paid');

          // Record settlement txid_out (Column 13 / M)
          if (data.txid_out) {
            sheet.getRange(i + 1, 13).setValue(String(data.txid_out));
          }

          SpreadsheetApp.flush();

          return ContentService.createTextOutput(
            JSON.stringify({ status: 'success', updated: true, orderId: orderIdToFind })
          ).setMimeType(ContentService.MimeType.JSON);
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({ status: 'not_found', orderId: orderIdToFind })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. DEFAULT ACTION: APPEND NEW ORDER ROW
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.orderId || '',
      data.fullName || '',
      data.whatsappNumber || '',
      data.email || '',
      data.country || '',
      data.device || '',
      data.planName || '',
      data.deviceCount || 1,
      data.fixedPrice || '',
      data.marketingConsent || 'No',
      data.paymentStatus || 'Pending',
      data.txid_out || '',
      data.webhookSecret || ''
    ]);

    // Force Google Sheets to write and flush the row immediately to disk
    SpreadsheetApp.flush();

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', orderId: data.orderId })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Simple health check when visiting the URL in browser
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'active', message: 'Pay2Me Google Sheets Webhook is running.' })
  ).setMimeType(ContentService.MimeType.JSON);
}
