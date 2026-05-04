import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet as WalletIcon, PlusCircle, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from '../components/ui/toaster';

interface WalletRequest {
  id: string;
  userId: string;
  amount: number;
  senderNumber: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export default function Wallet() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'add' | 'history'>('add');
  const [amount, setAmount] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<WalletRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Fetch user's wallet requests
    const q = query(
      collection(db, 'wallet_requests'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: WalletRequest[] = [];
      snapshot.forEach((doc) => {
        fetchedRequests.push({ id: doc.id, ...doc.data() } as WalletRequest);
      });
      setRequests(fetchedRequests);
    }, (error) => {
      console.warn("Wallet requests error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      toast({ title: 'Error', description: 'Minimum add money amount is 10 BDT', variant: 'destructive' });
      return;
    }
    if (senderNumber.length < 11 || trxId.length < 5) {
      toast({ title: 'Error', description: 'Please enter valid Sender Number and TrxID', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'wallet_requests'), {
        userId: user.uid,
        userEmail: user.email,
        amount: numAmount,
        senderNumber,
        trxId,
        status: 'pending',
        date: new Date().toISOString()
      });
      
      toast({ title: 'সফল হয়েছে!', description: 'আপনার রিকোয়েস্টটি পেন্ডিং এ আছে। এডমিন চেক করে এপ্রুভ করবে।' });
      setAmount('');
      setSenderNumber('');
      setTrxId('');
      setActiveTab('history');
    } catch (error) {
       console.error("Error adding wallet request:", error);
       toast({ title: 'Error', description: 'Failed to submit request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
     return <div className="p-8 text-center text-white">Please login to view wallet</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wide">Drubo's Topup Wallet</h1>
        <p className="text-white/60">আপনার ওয়ালেটে টাকা এড করুন এবং সহজেই কেনাকাটা করুন</p>
      </div>

      <div className="bg-gradient-to-br from-brand-orange to-brand-red rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100" />
        <div className="flex items-center gap-6 z-10">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
            <WalletIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-white/80 font-medium tracking-wider text-sm uppercase">Current Balance</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">৳{user.balance.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex border-b border-white/5">
           <button 
             onClick={() => setActiveTab('add')}
             className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'add' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-white/60 hover:text-white'}`}
           >
             <PlusCircle className="w-5 h-5" /> Add Money
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'history' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-white/60 hover:text-white'}`}
           >
             <FileText className="w-5 h-5" /> History
           </button>
        </div>

        <div className="p-6 sm:p-8">
           {activeTab === 'add' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <h3 className="text-xl font-bold text-white mb-4">bKash Payment</h3>
                  <div className="bg-[#E2136E]/10 border border-[#E2136E]/30 rounded-xl p-5 mb-6">
                    <p className="text-white/80 mb-2">bKash Send Money / Cash Out Number:</p>
                    <p className="text-2xl font-mono font-bold text-[#E2136E] bg-white/5 p-3 rounded text-center mb-2">
                       01518310744
                    </p>
                    <p className="text-sm text-white/60 text-center">Please send the exact amount and save the TrxID.</p>
                  </div>
               </div>

               <form onSubmit={handleAddMoney} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-white/80 mb-1">Amount (৳)</label>
                   <input required type="number" min="10" placeholder="e.g. 500" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-white/80 mb-1">Sender bKash Number</label>
                   <input required type="text" placeholder="e.g. 017XXXXXXXX" value={senderNumber} onChange={(e)=>setSenderNumber(e.target.value)} className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-white/80 mb-1">Transaction ID (TrxID)</label>
                   <input required type="text" placeholder="e.g. 8N7A6D5E" value={trxId} onChange={(e)=>setTrxId(e.target.value)} className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors" />
                 </div>
                 <button disabled={isSubmitting} type="submit" className="w-full bg-brand-orange hover:bg-brand-red text-white py-3 rounded-lg font-bold uppercase tracking-wider transition-colors disabled:opacity-50 mt-4">
                   {isSubmitting ? 'Submitting...' : 'Submit Request'}
                 </button>
               </form>
             </div>
           ) : (
             <div className="space-y-4">
               {requests.length === 0 ? (
                 <div className="text-center text-white/50 py-8">No wallet requests found.</div>
               ) : (
                 requests.map(req => (
                   <div key={req.id} className="bg-brand-dark border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-medium">৳{req.amount} via bKash</p>
                        <p className="text-sm text-white/50">TrxID: {req.trxId} • Sender: {req.senderNumber}</p>
                        <p className="text-xs text-white/40 mt-1">{new Date(req.date).toLocaleString('en-US')}</p>
                      </div>
                      <div>
                        {req.status === 'pending' && <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-sm font-medium"><Clock className="w-4 h-4"/> Pending</span>}
                        {req.status === 'approved' && <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle2 className="w-4 h-4"/> Approved</span>}
                        {req.status === 'rejected' && <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-sm font-medium"><XCircle className="w-4 h-4"/> Rejected</span>}
                      </div>
                   </div>
                 ))
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
