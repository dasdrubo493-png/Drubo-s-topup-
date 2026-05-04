import React from 'react';
import { Gamepad2, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-card mt-auto border-t border-white/5 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-brand-red p-1.5 rounded-md">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-wider text-white">DRUBO'S TOPUP</h2>
            </Link>
            <p className="text-white/60 text-sm max-w-md mb-4 leading-relaxed">
              Your most trusted and secure platform for Free Fire diamond top-ups in Bangladesh. We provide instant delivery and 24/7 support to ensure you never miss a beat in your gaming journey.
            </p>
            <div className="text-sm text-white/70 mb-6 space-y-1">
              <p>Email: <a href="mailto:drubo1034@gmail.com" className="text-brand-orange hover:underline">drubo1034@gmail.com</a></p>
              <p>Phone/WhatsApp: <a href="https://wa.me/8801973164780" className="text-brand-orange hover:underline">01973164780</a></p>
            </div>
            <div className="flex gap-4">
               {/* Dummy payment icons built with CSS/Text for simple visual */}
               <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E2136E]/10 rounded border border-[#E2136E]/20 text-[#E2136E] text-xs font-bold leading-none">bKash</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-white/50 hover:text-brand-orange transition-colors">Home</Link></li>
              <li><Link to="/" className="text-sm text-white/50 hover:text-brand-orange transition-colors">Track Order</Link></li>
              <li><a href="#" className="text-sm text-white/50 hover:text-brand-orange transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-sm text-white/50 hover:text-brand-orange transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Why Choose Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <Zap className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                <span>Instant Delivery</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span>100% Safe & Secure</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <HeartHandshake className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span>24/7 Customer Support</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-6 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} Drubo's Topup. All rights reserved.
            </p>
            <Link to="/admin" className="text-[10px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-widest font-bold">
              Admin Portal
            </Link>
          </div>
          <p className="text-white/40 text-xs flex items-center justify-center gap-1">
             Developed for Gamers
          </p>
        </div>
      </div>
    </footer>
  );
}
