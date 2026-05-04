import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import LiveOrderPopup from './LiveOrderPopup';
import FloatingWhatsApp from './FloatingWhatsApp';
import CartDrawer from './CartDrawer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {children}
      </main>
      <Footer />
      <LiveOrderPopup />
      <FloatingWhatsApp />
    </div>
  );
}
