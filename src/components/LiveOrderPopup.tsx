import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

const mockNames = ['Rahim***', 'Karim***', 'Sabbir***', 'Fahim***', 'Naim***', 'Sakib***', 'Hasan***'];
const mockPackages = ['100 Diamonds', '310 Diamonds', '520 Diamonds', 'Weekly Pass', 'Monthly Pass'];

export default function LiveOrderPopup() {
  const [order, setOrder] = useState<{ name: string; pkg: string; time: number } | null>(null);

  useEffect(() => {
    // Show a popup randomly every 15-30 seconds
    const showRandomOrder = () => {
      const name = mockNames[Math.floor(Math.random() * mockNames.length)];
      const pkg = mockPackages[Math.floor(Math.random() * mockPackages.length)];
      const minAgo = Math.floor(Math.random() * 5) + 1; // 1-5 mins ago

      setOrder({ name, pkg, time: minAgo });

      // Hide after 5 seconds
      setTimeout(() => {
        setOrder(null);
      }, 5000);
      
      const nextDelay = (Math.floor(Math.random() * 15) + 15) * 1000;
      setTimeout(showRandomOrder, nextDelay);
    };

    // Initial delay
    const initialTimeout = setTimeout(showRandomOrder, 5000);
    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-20 left-4 sm:bottom-4 sm:left-4 z-40 bg-brand-card border border-brand-red/20 rounded-lg p-3 shadow-2xl flex items-center gap-3 w-72 pointer-events-none"
        >
          <div className="bg-brand-red/10 p-2 rounded-full flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-brand-red" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {order.name} bought
            </p>
            <p className="text-brand-orange text-xs font-bold truncate">
              {order.pkg}
            </p>
            <p className="text-white/40 text-[10px] mt-0.5">
              {order.time} min ago
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
