/**
 * Google Apps Script for IPTV Order Google Sheets Integration
 *
 * HOW TO SET UP:
 * 1. Open a new Google Sheet
 * 2. Create the first row with these header titles:
 *    [Timestamp, Order ID, Full Name, WhatsApp Number, Email, Country, Device, Subscription Plan, Devices, Fixed Price, Marketing Consent, Payment Status]
 * 3. Go to "Extensions" -> "Apps Script"
 * 4. Paste this entire code into Code.gs
 * 5. Click "Deploy" -> "New deployment"
 * 6. Select type: "Web app"
 * 7. Set:
 *    - Description: "IPTV Order Hook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 8. Click "Deploy" and copy the Web App URL
 * 9. Paste the Web App URL into your .env.local file as:
 *    GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/xxxx/exec"
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
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

