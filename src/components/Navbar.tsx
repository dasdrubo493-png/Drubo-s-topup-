import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, Gamepad2, UserCircle, LogOut, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();

  const baseLinks = [
    { name: 'হোম (Home)', path: '/' },
  ];

  if (user) {
    baseLinks.push({ name: 'আমার অর্ডার (My Orders)', path: '/my-orders' });
    baseLinks.push({ name: 'ওয়ালেট (Wallet)', path: '/wallet' });
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-brand-dark/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-red p-1.5 rounded-md transform group-hover:rotate-12 transition-transform">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold leading-none tracking-wider text-white">DRUBO'S TOPUP</h1>
              <p className="text-[10px] text-brand-red font-medium uppercase tracking-widest hidden sm:block">Fast & Trusted</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {baseLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand-orange",
                  location.pathname === link.path ? "text-brand-red" : "text-white/70"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-4">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-white/80 hover:text-white transition-colors cursor-pointer">
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0.5, y: -10, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="absolute top-0 right-0 w-4 h-4 bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {user ? (
                <div className="flex items-center gap-3 bg-white/5 pl-3 pr-1 py-1 rounded-full border border-white/10">
                  <span className="text-xs font-medium text-white/80 max-w-[100px] truncate">{user.email}</span>
                  <button onClick={logout} className="p-1.5 bg-brand-red/20 text-brand-red rounded-full hover:bg-brand-red hover:text-white transition-colors" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold bg-brand-red hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  লগইন (Login)
                </button>
              )}
            </div>
          </nav>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-white/80 hover:text-white transition-colors cursor-pointer">
              <ShoppingCart className="w-5 h-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, y: -10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute top-0 right-0 w-4 h-4 bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              className="p-2 text-white/80 hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-16 left-0 right-0 bg-brand-card border-b border-white/5 p-4 flex flex-col gap-4 shadow-xl"
            >
              {baseLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-2 rounded-md text-sm font-medium",
                    location.pathname === link.path
                      ? "bg-brand-red/10 text-brand-red"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/10 mt-2">
                {user ? (
                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-white/80 truncate">{user.email}</span>
                    <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center gap-2 text-brand-red text-sm font-bold">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAuthModalOpen(true); setIsOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-brand-red text-white px-4 py-3 rounded-lg"
                  >
                    <UserCircle className="w-5 h-5" />
                    Login / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
