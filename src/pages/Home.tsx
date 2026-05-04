import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Info, Gamepad2, Gift, Zap, Timer, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import Reviews from '../components/Reviews';
import FAQ from '../components/FAQ';
import { toast } from '../components/ui/toaster';
import { useCart } from '../context/CartContext';
import { collection, query, orderBy, onSnapshot, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const initialProductsToSeed = [
  { category: 'diamond', title: 'Weekly', price: 171 },
  { category: 'diamond', title: 'Monthly', price: 847 },
  { category: 'diamond', title: '25 Diamond', price: 22 },
  { category: 'diamond', title: '50 Diamond', price: 39 },
  { category: 'diamond', title: '115 Diamond', price: 87 },
  { category: 'diamond', title: '240 Diamond', price: 174 },
  { category: 'diamond', title: '610 Diamond', price: 435 },
  { category: 'diamond', title: '1240 Diamond', price: 869 },
  { category: 'diamond', title: '2530 Diamond', price: 1738 },
  { category: 'diamond', title: 'Weekly Lite', price: 50 },
  { category: 'levelup', title: 'Level Up - Level 6', price: 44 },
  { category: 'levelup', title: 'Level Up - Level 10', price: 77 },
  { category: 'levelup', title: 'Level Up - Level 15', price: 77 },
  { category: 'levelup', title: 'Level Up - Level 20', price: 77 },
  { category: 'levelup', title: 'Level Up - Level 25', price: 77 },
  { category: 'levelup', title: 'Level Up - Level 30', price: 110 },
  { category: 'evo', title: 'Evo Access 3D', price: 77 },
  { category: 'evo', title: 'Evo Access 7D', price: 109 },
  { category: 'evo', title: 'Evo Access 30D', price: 314 },
];

export default function Home() {
  const [uid, setUid] = useState('');
  const [activeTab, setActiveTab] = useState<'diamond' | 'levelup' | 'evo'>('diamond');
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 30 });
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    let mounted = true;
    const qProducts = collection(db, 'products');

    getDocs(qProducts)
      .then((snapshot) => {
        if (!mounted) return;
        const fetchedProducts: any[] = [];
        snapshot.forEach((d) => {
          fetchedProducts.push({ id: d.id, ...d.data() });
        });
        
        // Sort locally by price
        fetchedProducts.sort((a, b) => a.price - b.price);
        
        if (fetchedProducts.length === 0) {
          setProducts(initialProductsToSeed.map((p, i) => ({ id: `default_${i}`, ...p })));
        } else {
          setProducts(fetchedProducts);
        }
        setLoadingProducts(false);
      })
      .catch((error) => {
        if (!mounted) return;
        console.error("Error fetching products:", error);
        setProducts(initialProductsToSeed.map((p, i) => ({ id: `default_${i}`, ...p })));
        setLoadingProducts(false);
      });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return { h: 2, m: 59, s: 59 }; // loop for demo
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckout = () => {
    if (!uid) {
      toast({ title: "Player UID Required", description: "Please enter your Free Fire Player UID.", variant: "destructive" });
      return;
    }
    if (uid.length < 5 || isNaN(Number(uid))) {
      toast({ title: "Invalid UID", description: "Please enter a valid numeric UID.", variant: "destructive" });
      return;
    }
    if (!selectedPkg) {
      toast({ title: "Package Required", description: "Please select a top-up package.", variant: "destructive" });
      return;
    }

    const pkg = products.find(p => p.id === selectedPkg);
    
    if (pkg) {
      addToCart({
        pkgId: pkg.id,
        title: pkg.title,
        price: pkg.price,
        uid: uid,
        quantity: 1
      });
      toast({ title: "কার্টে যোগ করা হয়েছে", description: "সফলভাবে কার্টে যুক্ত হয়েছে।" });
    }
  };

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-500">
      {/* Hero Banner Area */}
      <section className="relative rounded-2xl overflow-hidden bg-brand-card border border-white/5 shadow-2xl min-h-[340px] sm:h-[400px] flex items-center">
        {/* Background Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-brand-dark/40 z-10"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40 sepia-[.2]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80)' }}
          animate={{ 
            scale: [1, 1.05, 1],
            filter: ["hue-rotate(-30deg)", "hue-rotate(0deg)", "hue-rotate(-30deg)"]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        
        <div className="relative z-20 p-5 sm:p-12 w-full max-w-4xl flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-brand-red/20 text-brand-red text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 border border-brand-red/30">
              🔥 লিমিটেড টাইম অফার
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight uppercase tracking-wide mb-3 sm:mb-4">
              <span className="text-brand-orange block sm:inline">Instant</span> Diamonds এর সাথে আপনার গেম লেভেল আপ করুন
            </h2>
            <p className="text-white/70 text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-[95%] sm:max-w-full">
              Free Fire অ্যাকাউন্টে টপ আপ করার সবচেয়ে দ্রুত এবং নিরাপদ উপায়। কয়েক সেকেন্ডের মধ্যে ১০০% অটোমেটেড ডেলিভারি।
            </p>
            <div className="flex gap-4">
               <button onClick={() => window.scrollTo({ top: document.getElementById('topup-section')?.offsetTop, behavior: 'smooth' })} className="clip-polygon bg-brand-red hover:bg-brand-red-hover text-white font-bold py-2.5 sm:py-3 px-5 sm:px-8 text-xs sm:text-base transition-colors flex items-center gap-2">
                 <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> এখনই টপ আপ করুন
               </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center bg-black/40 backdrop-blur-md border border-brand-orange/30 p-6 rounded-2xl"
          >
             <div className="flex items-center gap-2 text-brand-orange font-bold uppercase tracking-wider mb-4">
               <Timer className="w-5 h-5" />
               <span>ফ্ল্যাশ সেল শেষ হবে</span>
             </div>
             <div className="flex gap-3 text-center">
               <div className="flex flex-col bg-brand-dark border border-white/10 rounded-lg p-3 w-16">
                 <span className="font-display text-3xl font-bold leading-none">{String(timeLeft.h).padStart(2, '0')}</span>
                 <span className="text-[10px] text-white/50 uppercase">ঘণ্টা</span>
               </div>
               <div className="text-2xl font-bold text-brand-orange mt-2">:</div>
               <div className="flex flex-col bg-brand-dark border border-white/10 rounded-lg p-3 w-16">
                 <span className="font-display text-3xl font-bold leading-none">{String(timeLeft.m).padStart(2, '0')}</span>
                 <span className="text-[10px] text-white/50 uppercase">মিনিট</span>
               </div>
               <div className="text-2xl font-bold text-brand-orange mt-2">:</div>
               <div className="flex flex-col bg-brand-dark border border-white/10 rounded-lg p-3 w-16">
                 <span className="font-display text-3xl font-bold leading-none">{String(timeLeft.s).padStart(2, '0')}</span>
                 <span className="text-[10px] text-white/50 uppercase">সেকেন্ড</span>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Main Topup Section */}
      <section id="topup-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Info & Game details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-brand-card rounded-xl p-6 border border-white/5 sticky top-24">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 overflow-hidden relative">
                 <Gamepad2 className="w-8 h-8 text-orange-500" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white">Free Fire</h3>
                 <p className="text-brand-orange text-xs font-semibold uppercase tracking-wider">Garena International</p>
               </div>
             </div>
             <p className="text-white/60 text-sm mb-6 leading-relaxed">
               Player UID ব্যবহার করে সরাসরি আপনার অ্যাকাউন্টে ডায়মন্ড পান। কোনো আইডি-পাসওয়ার্ড এর প্রয়োজন নেই।
             </p>
             <div className="space-y-3 bg-brand-dark/50 rounded-lg p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-white/50">কেনার আগে আপনার Player UID সঠিক কিনা তা নিশ্চিত করুন। ভুল UID তে ডেলিভারি হলে রিফান্ড করা হবে না।</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Col: Process flow */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Step 1: UID Input */}
          <div className="bg-brand-card rounded-xl border border-white/5 overflow-hidden">
            <div className="bg-brand-red/10 border-b border-brand-red/20 px-6 py-4 flex items-center gap-3">
               <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-bold font-display">1</span>
               <h3 className="font-bold text-white text-lg">আপনার প্লেয়ার ইউআইডি দিন</h3>
            </div>
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  placeholder="যেমন: 191294821"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                />
              </div>
              <p className="text-[11px] text-white/40 mt-2 flex items-center gap-1">
                আপনার UID পেতে গেমের প্রধান স্ক্রিনের উপরে বাম কোণে আপনার প্রোফাইল অ্যাভাটারে ট্যাপ করুন।
              </p>
            </div>
          </div>

          {/* Step 2: Select Package */}
          <div className="bg-brand-card rounded-xl border border-white/5 overflow-hidden">
            <div className="bg-brand-red/10 border-b border-brand-red/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-bold font-display">2</span>
                 <h3 className="font-bold text-white text-lg">টপ-আপ অপশন বেছে নিন</h3>
              </div>
            </div>

            {/* Category Selectors (Hot Deals Style) */}
            <div className="p-4 sm:p-6 border-b border-white/5 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 sm:gap-6 min-w-max">
                
                {/* Normal Topup BD */}
                <button
                  onClick={() => { setActiveTab('diamond'); setSelectedPkg(null); }}
                  className="flex flex-col items-center gap-3 w-[110px] sm:w-[120px] group"
                >
                  <div className={cn(
                    "w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-2xl overflow-hidden relative border-[3px] transition-all duration-300",
                    activeTab === 'diamond' 
                      ? "border-brand-orange shadow-[0_0_20px_rgba(255,123,0,0.3)] scale-105" 
                      : "border-transparent hover:border-white/20 hover:scale-105"
                  )}>
                     {/* Background gradient simulating the image */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-800 via-rose-950 to-black" />
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 Mix-blend-overlay"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-between py-3 text-center">
                        <div className="bg-black/60 text-white text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-white/20">Auto Delivery</div>
                        <Gamepad2 className={cn("w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform duration-300", activeTab === 'diamond' ? "text-brand-orange scale-110" : "text-red-400")} />
                        <div className="text-white font-black text-[12px] sm:text-[13px] leading-tight tracking-wider uppercase drop-shadow-md">Free Fire</div>
                     </div>
                  </div>
                  <span className={cn("text-xs sm:text-sm font-bold uppercase tracking-wide", activeTab === 'diamond' ? "text-brand-orange" : "text-white")}>UID Topup BD</span>
                </button>

                {/* Level Up Pass */}
                <button
                  onClick={() => { setActiveTab('levelup'); setSelectedPkg(null); }}
                  className="flex flex-col items-center gap-3 w-[110px] sm:w-[120px] group"
                >
                  <div className={cn(
                    "w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-2xl overflow-hidden relative border-[3px] transition-all duration-300",
                    activeTab === 'levelup' 
                      ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105" 
                      : "border-transparent hover:border-white/20 hover:scale-105"
                  )}>
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black" />
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                        <div className="text-white font-black text-xs sm:text-sm uppercase mb-1 drop-shadow-lg tracking-widest">Level Up<br/>Pass</div>
                        <Gift className={cn("w-8 h-8 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-transform duration-300", activeTab === 'levelup' ? "text-cyan-400 scale-110" : "text-cyan-700")} />
                        <div className="flex gap-1 mt-2">
                           <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                           <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse delay-75"></span>
                           <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-pulse delay-150"></span>
                        </div>
                     </div>
                  </div>
                  <span className={cn("text-xs sm:text-sm font-bold uppercase tracking-wide", activeTab === 'levelup' ? "text-cyan-400" : "text-white")}>Level Up Pass</span>
                </button>

                {/* Evo Access */}
                <button
                  onClick={() => { setActiveTab('evo'); setSelectedPkg(null); }}
                  className="flex flex-col items-center gap-3 w-[110px] sm:w-[120px] group"
                >
                  <div className={cn(
                    "w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-2xl overflow-hidden relative border-[3px] transition-all duration-300",
                    activeTab === 'evo' 
                      ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105" 
                      : "border-transparent hover:border-white/20 hover:scale-105"
                  )}>
                     <div className="absolute inset-0 bg-gradient-to-br from-[#2b084d] via-[#10031d] to-black" />
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-red-800 to-orange-600 rounded-xl border border-yellow-500/50 flex flex-col items-center justify-center mb-1 sm:mb-2 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                           <Zap className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                        <div className="text-purple-200 font-bold text-[11px] sm:text-[12px] uppercase tracking-widest leading-tight">Evo<br/>Access</div>
                     </div>
                  </div>
                  <span className={cn("text-xs sm:text-sm font-bold uppercase tracking-wide", activeTab === 'evo' ? "text-purple-400" : "text-white")}>Evo Access</span>
                </button>

              </div>
            </div>

            <div className="p-4 sm:p-6 bg-brand-dark/30">
              {loadingProducts ? (
                 <div className="flex justify-center p-8">
                   <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                 </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {products.filter(p => p.category === activeTab).map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg.id)}
                      className={cn(
                        "relative rounded-xl p-5 border transition-all duration-200 flex flex-col items-center justify-center gap-1 group min-h-[90px]",
                        selectedPkg === pkg.id 
                          ? "border-brand-orange bg-brand-orange/10 shadow-[0_0_15px_rgba(255,123,0,0.15)]" 
                          : "border-white/5 bg-brand-dark hover:border-white/20 hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="font-bold text-white text-[15px] tracking-wide text-center">
                        {pkg.title}
                      </div>
                      <div className="text-brand-orange text-[15px] font-bold">
                        ৳{pkg.price}
                      </div>
                      
                      {/* Selected indicator checkmark */}
                      {selectedPkg === pkg.id && (
                        <div className="absolute inset-0 border-2 border-brand-orange rounded-xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                  {products.filter(p => p.category === activeTab).length === 0 && (
                    <div className="col-span-full py-8 text-center text-white/40">
                      এই ক্যাটাগরিতে এখনও কোনো প্রোডাক্ট যুক্ত করা হয়নি।
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex flex-col gap-3 z-10 w-full">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-brand-orange to-brand-red hover:from-brand-red hover:to-brand-orange text-white shadow-[0_0_20px_rgba(255,59,59,0.3)] transition-all flex items-center justify-center gap-2"
            >
              কার্টে যোগ করুন
              {selectedPkg && (
                 <span className="bg-white/20 px-2 py-0.5 rounded text-sm ml-2">
                   ৳{products.find(p => p.id === selectedPkg)?.price}
                 </span>
              )}
            </motion.button>
            <div className="text-center">
              <button 
                onClick={() => navigate('/checkout')}
                className="text-brand-orange hover:text-orange-400 font-bold underline underline-offset-4 text-sm"
              >
                কার্ট এবং চেকআউট এ যান
              </button>
            </div>
          </div>
          
        </div>
      </section>

      {/* Reviews Section */}
      <Reviews />

      {/* Reviews, FAQ etc... can go here */}
      <FAQ />

    </div>
  );
}

