/**
 * Google Apps Script for IPTV Order Google Sheets Integration
 *
 * HOW TO SET UP:
 * 1. Open your Google Sheet
 * 2. Create the first row with these header titles:
 *    [Timestamp, Order ID, Full Name, WhatsApp Number, Email, Country, Device, Subscription Plan, Devices, Fixed Price, Marketing Consent, Payment Status]
 * 3. Go to "Extensions" -> "Apps Script"
 * 4. Paste this entire code into Code.gs
 * 5. Click "Deploy" -> "Manage deployments" -> Click Edit (pencil icon) -> select "New version" -> Click "Deploy"
 *    (Or if first time: "Deploy" -> "New deployment" -> Web app -> Execute as "Me", Who has access "Anyone")
 * 6. Copy the Web App URL and add it to your environment variables as GOOGLE_SHEETS_WEBHOOK_URL
 */

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Write to tab named 'Orders', or 'Sheet1', or fallback to the very first tab
    const sheet = ss.getSheetByName('Orders') || ss.getSheetByName('Sheet1') || ss.getSheets()[0];
    const data = JSON.parse(e.postData.contents);

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
      data.paymentStatus || 'Pending'
    ]);

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
