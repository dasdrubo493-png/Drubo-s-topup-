import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[80px] right-4 sm:right-8 w-[calc(100%-32px)] sm:w-[380px] max-h-[calc(100vh-100px)] bg-brand-dark border border-white/10 rounded-2xl z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-brand-card shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-orange" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display">আপনার কার্ট (Cart)</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="overflow-y-auto p-4 shrink min-h-[150px]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-white/40 space-y-3">
                  <ShoppingCart className="w-10 h-10 opacity-20" />
                  <p className="text-sm">আপনার কার্ট খালি।</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 relative group">
                    <div className="bg-brand-dark rounded-lg p-2 flex items-center justify-center border border-white/5 shrink-0">
                      <span className="font-bold text-brand-orange">x{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{item.title}</h4>
                      <p className="text-xs text-white/50 mb-1">UID: <span className="font-mono text-white/70">{item.uid}</span></p>
                      <p className="font-bold text-brand-orange text-sm">৳{item.price * item.quantity}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-3 right-3 p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-white/10 bg-brand-card shrink-0 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-white/70 font-medium">মোট (Total):</span>
                  <span className="font-display text-2xl font-bold text-brand-orange">৳{total}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-orange to-brand-red hover:from-brand-red hover:to-brand-orange text-white py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,59,59,0.3)]"
                >
                  চেকআউট করুন <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
