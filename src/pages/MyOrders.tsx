import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle2, Gamepad2, Loader2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { CartItem } from '../context/CartContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

type Order = {
  id: string;
  userEmail: string;
  items: CartItem[];
  totalAmount: number;
  method: string;
  phone: string;
  trxId: string;
  date: string;
  status: 'pending' | 'completed' | 'rejected';
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders: Order[] = [];
        snapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        
        // Sort explicitly by date descending to avoid requiring a composite index in Firestore
        fetchedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setOrders(fetchedOrders);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Package className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Please Login</h2>
        <p className="text-white/50">Login to view your order history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="bg-brand-red p-2 rounded-lg">
          <Package className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white tracking-wide">My Orders</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-brand-card border border-white/5 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-brand-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No orders found</h3>
          <p className="text-white/50 text-sm">You haven't placed any topup orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-brand-card border border-white/5 rounded-xl overflow-hidden transition-all hover:bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row justify-between p-4 border-b border-white/5 gap-4">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <div className="text-sm">
                    <span className="text-white/40 block text-xs uppercase tracking-wider mb-0.5">Order ID</span>
                    <span className="text-white font-mono font-bold">#{order.id.toUpperCase()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-white/40 block text-xs uppercase tracking-wider mb-0.5">Date</span>
                    <span className="text-white">{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-sm">
                  <div className="text-right">
                    <span className="text-white/40 block text-xs uppercase tracking-wider mb-0.5">Total</span>
                    <span className="text-brand-orange font-bold">৳{order.totalAmount}</span>
                  </div>
                  <div>
                    {order.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
                        <Clock className="w-3.5 h-3.5" /> Processing
                      </span>
                    )}
                    {order.status === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-wider border border-green-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                    {order.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-brand-dark/30">
                 <div className="space-y-3">
                   {order.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center text-sm">
                       <div className="flex gap-4">
                         <span className="text-white font-bold">{item.title}</span>
                         <span className="text-white/50 hidden sm:inline-block">UID: {item.uid}</span>
                         {item.quantity > 1 && <span className="text-white/40 text-xs">x{item.quantity}</span>}
                       </div>
                       <span className="text-white/80">৳{item.price * item.quantity}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
