import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pay2me.online'),
  title: 'Pay2Me — Get Your IPTV Subscription | Fast & Secure Checkout',
  description:
    'Choose your IPTV subscription plan, select your devices, and complete your secure order. Instant activation, 4K UHD streaming, and 24/7 support.',
  keywords: ['pay2me', 'iptv subscription', 'iptv order', 'instant iptv activation', 'secure iptv checkout'],
  openGraph: {
    title: 'Pay2Me — Get Your IPTV Subscription | Fast & Secure Checkout',
    description: 'Instant IPTV activation with 4K UHD streams, EPG, anti-freeze technology, and multi-device support.',
    url: 'https://www.pay2me.online',
    siteName: 'Pay2Me',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pay2Me — Get Your IPTV Subscription',
    description: 'Instant IPTV activation with 4K UHD streams, EPG, and multi-device support.',
  },
  alternates: {
    canonical: 'https://www.pay2me.online',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { LanguageSelector } from '@/components/LanguageSelector';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
        <LanguageSelector variant="floating" />
      </body>
    </html>
  );
}
