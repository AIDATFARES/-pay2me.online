# IPTV One-Page Order & Payment Portal

A fast, lightweight, production-ready one-page IPTV order and payment website built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Key Features

- **Focused One-Page Architecture**: Zero distraction, conversion-optimized checkout flow.
- **Strict Predefined Fixed Price Table**:
  - No client-side or server-side math calculations.
  - Price is retrieved directly from a lookup matrix.
  - Complete server-side security: tampered client prices are completely ignored.
- **Step-by-Step Selection**:
  1. **Choose Plan**: 1 Month ($15), 3 Months ($35), 6 Months ($50), 12 Months ($70) with feature highlights (no device counts in plan cards).
  2. **Choose Devices**: 1 Device, 2 Devices, or 3 Devices with live fixed price lookup.
  3. **Customer Information**: Full Name, WhatsApp Number, Email, Country, and Device.
  4. **Optional Marketing Consent**: Unchecked by default, non-intrusive.
  5. **Live Order Summary & Checkout**: Shows exact total and connects to CardToUSDT.
- **Google Sheets Integration**: Automatically records order rows in real-time via Google Apps Script Web App.
- **CardToUSDT Payment Gateway**: Creates secure server-side checkout sessions using verified fixed prices.
- **Generic WhatsApp Return Flow**: Post-order confirmation with a clean "Return to WhatsApp" button with **zero brand tracking**, no pre-filled recipient, and no message templates.
- **Technical SEO**: Included metadata, OpenGraph cards, `robots.txt`, and dynamic `sitemap.xml`.

---

## 📋 Fixed Price Matrix

| Subscription Plan | 1 Device | 2 Devices | 3 Devices |
| :---------------- | :------: | :-------: | :-------: |
| **1 Month**       |   $15    |    $29    |    $44    |
| **3 Months**      |   $35    |    $68    |   $102    |
| **6 Months**      |   $50    |    $98    |   $145    |
| **12 Months**     |   $70    |   $137    |   $203    |

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

