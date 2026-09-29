import React from 'react';
import { Header } from '@/components/Header';
import { OrderForm } from '@/components/OrderForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/25 to-violet-50/35 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-[680px] mx-auto">
        <Header />
        <OrderForm />
        <footer className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p>© {new Date().getFullYear()} Pay2Me.online. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            Encrypted Checkout • Instant Access • High-Speed Global Streaming
          </p>
        </footer>
      </div>
    </main>
  );
}

