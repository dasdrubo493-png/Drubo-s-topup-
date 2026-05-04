import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Copy, CheckCircle2, ShieldCheck, Trash2, Wallet, Loader2 } from 'lucide-react';
import { toast } from '../components/ui/toaster';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const sendTelegramNotification = async (orderData: any, amount: number) => {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'notifications'));
    if (settingsSnap.exists()) {
      const { telegramToken, telegramChatId } = settingsSnap.data();
      if (telegramToken && telegramChatId) {
        let msg = `🛍️ *New Order Received*\n\n`;
        msg += `*Method:* ${orderData.method}\n`;
        msg += `*Amount:* ৳${amount}\n`;
        msg += `*Email:* ${orderData.userEmail}\n`;
        if (orderData.phone) msg += `*Phone:* ${orderData.phone}\n`;
        if (orderData.trxId) msg += `*TrxID:* \`${orderData.trxId}\`\n\n`;
        
        msg += `*Items:*\n`;
        orderData.items.forEach((item: any) => {
          msg += `- ${item.title} (Qty: ${item.quantity})\n  UID: \`${item.uid}\`\n`;
        });
        
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
             chat_id: telegramChatId,
             text: msg,
             parse_mode: 'Markdown'
          })
        });
      }
    }
  } catch (error) {
    console.error("Failed to send telegram notification:", error);
  }
};

const methods = [
  { id: 'wallet', name: "Drubo's Wallet", color: 'bg-brand-orange', border: 'border-brand-orange', instruction: 'Pay easily with your wallet' },
  { id: 'bkash', name: 'bKash', color: 'bg-[#E2136E]', border: 'border-[#E2136E]', instruction: 'Send money to: 01518310744' },
  { id: 'whatsapp', name: 'Order by WhatsApp', color: 'bg-[#25D366]', border: 'border-[#25D366]', instruction: 'Direct order via WhatsApp' }
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, total, itemCount } = useCart();
  const { user } = useAuth();
  
  const [selectedMethod, setSelectedMethod] = useState(methods[0].id);
  const [phone, setPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !isSubmitting && !hasSubmitted && !showSuccessAnimation) {
      navigate('/');
    }
  }, [items, navigate, isSubmitting, hasSubmitted, showSuccessAnimation]);

  if (items.length === 0 && !hasSubmitted && !showSuccessAnimation) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Number copied to clipboard.' });
  };

  const handleWhatsAppOrder = () => {
    let message = `Hello, I want to place an order:%0A%0A`;
    items.forEach(item => {
      message += `- ${item.title} (UID: ${item.uid}) x${item.quantity} = ৳${item.price * item.quantity}%0A`;
    });
    message += `%0ATotal: ৳${total}`;
    
    window.open(`https://wa.me/8801973164780?text=${message}`, '_blank');
  };

  const handleConfirm = async () => {
    if (selectedMethod === 'whatsapp') {
      handleWhatsAppOrder();
      return;
    }

    if (!user) {
       toast({ title: 'Login Required', description: 'Please login before checking out.', variant: 'destructive' });
       return;
    }

    if (selectedMethod === 'wallet') {
      if (user.balance < total) {
        toast({ title: 'Insufficient Balance', description: 'Please add money to your wallet.', variant: 'destructive' });
        return;
      }
      
      setIsSubmitting(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          balance: increment(-total)
        });
        
        const orderData = {
          userEmail: user.email,
          userId: user.uid,
          items: items,
          totalAmount: total,
          method: 'wallet',
          phone: "Wallet User",
          trxId: `WT-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString(),
          status: 'pending'
        };
        await addDoc(collection(db, 'orders'), orderData);
        sendTelegramNotification(orderData, total);

        setHasSubmitted(true);
        setShowSuccessAnimation(true);
        clearCart();
        setTimeout(() => {
          setShowSuccessAnimation(false);
          toast({ title: 'অর্ডার সফল হয়েছে!', description: 'টাকা আপনার ওয়ালেট থেকে কাটা হয়েছে এবং অর্ডার পেন্ডিং এ আছে।' });
          navigate('/my-orders');
        }, 2500);
      } catch (error) {
        console.error("Wallet order failed:", error);
        toast({ title: 'Error', description: 'Failed to process wallet payment', variant: 'destructive' });
        setIsSubmitting(false);
      }
      return;
    }

    if (!phone || !trxId) {
       toast({ title: 'Missing Info', description: 'Please enter your phone number and Transaction ID.', variant: 'destructive' });
       return;
    }
    
    setIsSubmitting(true);
    
    // Simulate 2 seconds verifying for bkash
    setTimeout(async () => {
      const orderData = {
        userEmail: user.email,
        userId: user.uid,
        items: items,
        totalAmount: total,
        method: selectedMethod,
        phone,
        trxId,
        date: new Date().toISOString(),
        status: 'pending'
      };
      addDoc(collection(db, 'orders'), orderData).catch(error => console.error("Error creating order:", error));
      sendTelegramNotification(orderData, total);
      
      setHasSubmitted(true);
      setIsSubmitting(false);
      setShowSuccessAnimation(true);
      clearCart();
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
        toast({ title: 'অর্ডার সফল হয়েছে!', description: 'আপনার অর্ডারটি পেন্ডিং এ আছে।' });
        navigate('/my-orders');
      }, 2500);
    }, 2000);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Continue Shopping
      </button>

      <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8">
        {/* Left: Cart Summary */}
        <div className="bg-brand-card rounded-xl border border-white/5 p-4 sm:p-6 h-fit">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white font-display tracking-wide">কার্ট সামারি (Cart Summary)</h2>
              <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/70">{itemCount} Items</span>
           </div>
           
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
             {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-brand-dark/50 p-3 rounded-lg border border-white/5">
                  <div>
                    <h4 className="text-brand-orange font-bold text-sm tracking-wide">{item.title}</h4>
                    <p className="text-white/60 text-xs mt-0.5">UID: <span className="text-white">{item.uid}</span></p>
                    {item.quantity > 1 && (
                      <p className="text-white/40 text-[10px]">Qty: {item.quantity}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-bold text-sm">৳{item.price * item.quantity}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-white/30 hover:text-brand-red transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
             ))}
           </div>

           <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                 <span className="text-white/80 font-medium">মোট পরিশোধযোগ্য মূল্য</span>
                 <span className="text-brand-orange font-display text-2xl font-bold tracking-wider">৳{total}</span>
              </div>
           </div>

           <div className="mt-6 bg-brand-dark rounded-lg p-4 flex items-start gap-3 border border-brand-orange/20">
             <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
             <p className="text-[11px] text-green-400/80 leading-relaxed uppercase tracking-wider font-bold">
               Secure checkout powered by Drubo's Topup. Verify Player UID before paying.
             </p>
           </div>
        </div>

        {/* Right: Payment details */}
        <div className="bg-brand-card rounded-xl border border-white/5 p-4 sm:p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 font-display tracking-wide">পেমেন্টের বিবরণ (Payment Details)</h2>

          {!user && selectedMethod !== 'whatsapp' && (
            <div className="mb-6 bg-red-900/20 text-red-400 p-3 rounded-lg text-sm font-bold border border-red-500/20 text-center">
               চেকআউট করতে আপনাকে লগইন করতে হবে।
            </div>
          )}

          <div className="space-y-6 opacity-100 transition-opacity">
            {/* Method selection */}
            <div>
              <p className="text-sm font-medium text-white/80 mb-3">পেমেন্ট মেথড নির্বাচন করুন</p>
              <div className="grid grid-cols-2 gap-3">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={cn(
                      "py-3 px-2 rounded-lg text-sm font-bold border transition-all",
                      selectedMethod === m.id
                        ? `${m.color} text-white border-transparent`
                        : "bg-brand-dark text-white/60 hover:text-white border-white/10"
                    )}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedMethod === 'bkash' && (
              <>
                {/* Payment instructions */}
                <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-white/60 mb-2">এই নম্বরে সেন্ড মানি (Personal) করুন:</p>
                  <div className="flex items-center justify-between bg-brand-dark p-3 rounded-md border border-white/10">
                    <span className="text-xl font-mono font-bold text-brand-orange tracking-widest">
                      01518310744
                    </span>
                    <button 
                      onClick={() => handleCopy('01518310744')}
                      className="p-2 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-brand-red text-xs mt-3 font-semibold text-center">Amount: ৳{total}</p>
                </div>

                {/* Input forms */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">আপনার bKash নম্বর (Your Account Number)</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g 017XXXXXXX" 
                      className="w-full bg-brand-dark border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">ট্রানজ্যাকশন আইডি (Transaction ID)</label>
                    <input 
                      type="text" 
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g 8JXK82MX" 
                      className="w-full bg-brand-dark border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-brand-orange font-mono uppercase"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedMethod === 'whatsapp' && (
              <div className="bg-black/30 rounded-lg p-4 border border-white/5 text-center">
                <p className="text-sm text-white/80 mb-2">আপনি কি হোয়াটসঅ্যাপের মাধ্যমে অর্ডার কনফার্ম করতে চান?</p>
                <p className="text-xs text-white/50">নিচের বাটনে ক্লিক করলে আপনাকে হোয়াটসঅ্যাপে নিয়ে যাওয়া হবে।</p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={selectedMethod === 'bkash' ? (isSubmitting || !user) : false}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-2",
                (selectedMethod === 'bkash' && (isSubmitting || !user)) ? "bg-brand-dark border border-white/10 cursor-not-allowed opacity-50" : selectedMethod === 'whatsapp' ? "bg-[#25D366] hover:bg-[#128C7E] shadow-[0_0_20px_rgba(37,211,102,0.3)]" : "bg-gradient-to-r from-brand-orange to-brand-red hover:from-brand-red hover:to-brand-orange shadow-[0_0_20px_rgba(255,59,59,0.3)]"
              )}
            >
              {isSubmitting ? 'Verifying...' : selectedMethod === 'whatsapp' ? 'Send Order to WhatsApp' : 'Confirm Order'}
            </motion.button>
          </div>
        </div>
      </div>
      </div>

      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/90 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-brand-card p-8 sm:p-10 rounded-3xl border border-white/10 flex flex-col items-center max-w-sm w-full text-center shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
              className="w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 font-display">অর্ডার সফল হয়েছে!</h2>
            <p className="text-white/60 mb-8 text-sm">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।</p>
            <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to orders...</span>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
