import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Package, Users, DollarSign, Settings, Search, CheckCircle2, Clock, XCircle, Trash2, Loader2, Wallet as WalletIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from '../components/ui/toaster';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [walletRequests, setWalletRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const { user, isAdmin, loginEmail, signupEmail, logout } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Form states for new/edit product
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null);
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('diamond');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      await loginEmail(email, password);
    } catch (error: any) {
      // If login fails (possibly user not found), try to sign them up automatically
      try {
        await signupEmail(email, password);
        toast({ title: 'Account Created', description: 'Admin account registered successfully.' });
      } catch (signupError: any) {
        toast({ title: 'Authentication Error', description: error.message + ' / ' + signupError.message, variant: 'destructive' });
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: any[] = [];
      snapshot.forEach((d) => {
        fetchedOrders.push({ id: d.id, ...d.data() });
      });
      setOrders(fetchedOrders);
      setLoading(false);

      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      } else {
        const addedChanges = snapshot.docChanges().filter(change => change.type === 'added');
        if (addedChanges.length > 0) {
          toast({ 
            title: 'নতুন অর্ডার (New Order)! 🔔', 
            description: `নতুন ${addedChanges.length}টি অর্ডার এসেছে। চেক করুন।` 
          });
          try {
            // Optional: Web audio beep
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch beep
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          } catch(e) {}
        }
      }
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    
    setLoadingProducts(true);
    const qProducts = collection(db, 'products');
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const fetchedProducts: any[] = [];
      snapshot.forEach((d) => {
        fetchedProducts.push({ id: d.id, ...d.data() });
      });
      
      // Sort locally to avoid Firestore index requirements
      fetchedProducts.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.price - b.price;
      });
      
      setProducts(fetchedProducts);
      setLoadingProducts(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoadingProducts(false);
    });

    return () => unsubscribeProducts();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingWallet(true);
    const qWallet = query(collection(db, 'wallet_requests'), orderBy('date', 'desc'));
    const unsubscribeWallet = onSnapshot(qWallet, (snapshot) => {
      const requests: any[] = [];
      snapshot.forEach(d => requests.push({ id: d.id, ...d.data() }));
      setWalletRequests(requests);
      setLoadingWallet(false);
    }, (error) => {
      console.error("Error fetching wallet requests:", error);
      setLoadingWallet(false);
    });
    return () => unsubscribeWallet();
  }, [isAdmin]);

  const handleApproveWallet = async (reqId: string, userId: string, amount: number) => {
    try {
      // 1. Update wallet request status
      await updateDoc(doc(db, 'wallet_requests', reqId), { status: 'approved' });
      // 2. Increment user balance
      await updateDoc(doc(db, 'users', userId), {
        balance: increment(amount)
      });
      toast({ title: 'Success', description: 'Wallet top-up approved' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleRejectWallet = async (reqId: string) => {
    try {
      await updateDoc(doc(db, 'wallet_requests', reqId), { status: 'rejected' });
      toast({ title: 'Success', description: 'Wallet top-up rejected' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteWalletRequest = async (reqId: string) => {
    try {
      if (window.confirm('Delete this request?')) {
        await deleteDoc(doc(db, 'wallet_requests', reqId));
        toast({ title: 'Deleted', description: 'Wallet request removed.' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle || !productPrice || !productCategory) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    
    try {
      const priceNum = Number(productPrice);
      if (isEditingProduct) {
        await updateDoc(doc(db, 'products', isEditingProduct), {
          title: productTitle,
          price: priceNum,
          category: productCategory
        });
        toast({ title: 'Success', description: 'Product updated successfully' });
      } else {
        await addDoc(collection(db, 'products'), {
          title: productTitle,
          price: priceNum,
          category: productCategory
        });
        toast({ title: 'Success', description: 'Product added successfully' });
      }
      resetProductForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEditProduct = (prod: any) => {
    setIsEditingProduct(prod.id);
    setProductTitle(prod.title);
    setProductPrice(prod.price.toString());
    setProductCategory(prod.category);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this product?")) {
        await deleteDoc(doc(db, 'products', id));
        toast({ title: 'Success', description: 'Product deleted' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetProductForm = () => {
    setIsEditingProduct(null);
    setProductTitle('');
    setProductPrice('');
  };

  const handleSeedDefaults = async () => {
    try {
      if (!window.confirm("This will clear all current products and load default products. Are you sure?")) return;
      
      setLoadingProducts(true);
      // Delete existing
      for (const p of products) {
        await deleteDoc(doc(db, 'products', p.id));
      }
      
      // Seed new
      const defaultProducts = [
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
      
      for (const p of defaultProducts) {
        await addDoc(collection(db, 'products'), p);
      }
      
      toast({ title: 'Success', description: 'Default products loaded successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoadingProducts(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        status: newStatus
      });
      toast({ title: 'Status Updated', description: `Order status changed to ${newStatus}.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
      toast({ title: 'Order Deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto px-4">
        <Users className="w-16 h-16 text-brand-red mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
        {user ? (
          <>
            <p className="text-white/50 mb-6">Your account ({user.email}) does not have admin privileges.</p>
            <button
              onClick={logout}
              className="bg-brand-red hover:bg-brand-red-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <form onSubmit={handleLogin} className="w-full bg-brand-card p-6 rounded-xl border border-white/5 mt-4 space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1 block">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-dark border border-white/10 focus:border-brand-red rounded-xl py-2 px-3 text-white outline-none"
                placeholder="drubo1034@gmail.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-dark border border-white/10 focus:border-brand-red rounded-xl py-2 px-3 text-white outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-brand-red text-white font-bold py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isLoginLoading ? 'Logging in...' : 'Login to Admin'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 min-h-[600px]">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-2">
         <div className="mb-6 px-4">
           <h2 className="text-xl font-bold font-display tracking-wider text-brand-orange">ADMIN PORTAL</h2>
           <p className="text-white/40 text-xs">Frontend Demo Mode</p>
         </div>

         {[
           { id: 'orders', icon: Package, label: 'Manage Orders' },
           { id: 'wallet', icon: WalletIcon, label: 'Wallet Requests' },
           { id: 'pricing', icon: DollarSign, label: 'Pricing & Packages' },
           { id: 'users', icon: Users, label: 'Customers' },
           { id: 'settings', icon: Settings, label: 'Settings' },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left",
               activeTab === tab.id 
                 ? "bg-brand-red text-white shadow-[0_0_15px_rgba(255,59,59,0.3)]" 
                 : "text-white/60 hover:bg-white/5 hover:text-white"
             )}
           >
             <tab.icon className="w-5 h-5" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-brand-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            {activeTab === 'orders' && 'Recent Orders'}
            {activeTab === 'wallet' && 'Wallet Top-ups'}
            {activeTab === 'pricing' && 'Manage Pricing'}
            {activeTab === 'users' && 'Customer Database'}
            {activeTab === 'settings' && 'System Settings'}
          </h2>
          {activeTab === 'orders' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="bg-brand-dark border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:border-brand-orange transition-colors"
                disabled
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-0">
          {activeTab === 'wallet' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-brand-dark/50 text-white/40 text-xs uppercase font-semibold border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">ID / Date</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">bKash Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingWallet ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-orange" />
                        Loading requests...
                      </td>
                    </tr>
                  ) : walletRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-white/40">No records found.</td>
                    </tr>
                  ) : walletRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-brand-orange text-xs">{req.id}</div>
                        <div className="text-[10px] text-white/30 mt-1">{new Date(req.date).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{req.userEmail}</td>
                      <td className="px-6 py-4 text-brand-orange font-bold">৳{req.amount}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-mono">Sender: {req.senderNumber}</span>
                          <span className="text-[10px] font-mono text-white/50">TrxID: {req.trxId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center w-fit gap-1",
                          req.status === 'approved' && "bg-green-500/10 text-green-400 border-green-500/20",
                          req.status === 'pending' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                          req.status === 'rejected' && "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {req.status === 'pending' && <Clock className="w-3 h-3" />}
                          {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {req.status === 'pending' && (
                           <>
                             <button onClick={() => handleApproveWallet(req.id, req.userId, req.amount)} className="p-1.5 hover:bg-green-500/20 rounded text-green-400 transition-colors" title="Approve">
                               <CheckCircle2 className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleRejectWallet(req.id)} className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors" title="Reject">
                               <XCircle className="w-4 h-4" />
                             </button>
                           </>
                        )}
                        <button onClick={() => handleDeleteWalletRequest(req.id)} className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-brand-dark/50 text-white/40 text-xs uppercase font-semibold border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">ID / Date</th>
                    <th className="px-6 py-4">User Email</th>
                    <th className="px-6 py-4">Items / UIDs</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-orange" />
                        Loading orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-white/40">No orders found.</td>
                    </tr>
                  ) : orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-brand-orange text-xs">{order.id}</div>
                        <div className="text-[10px] text-white/30 mt-1">{new Date(order.date).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white text-xs">{order.userEmail}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                           {order.items?.map((item: any, i: number) => (
                             <div key={i} className="text-xs">
                               <span className="font-bold text-white">{item.title}</span> {item.quantity > 1 && `x${item.quantity}`} 
                               <span className="text-white/40"> to </span> 
                               <span className="font-mono text-white/80">{item.uid}</span>
                             </div>
                           ))}
                        </div>
                        <div className="text-brand-orange font-bold mt-1">৳{order.totalAmount}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs uppercase font-bold text-white/50">{order.method}</span>
                          <span className="text-[10px] font-mono">{order.trxId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center w-fit gap-1",
                          order.status === 'completed' && "bg-green-500/10 text-green-400 border-green-500/20",
                          order.status === 'pending' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                          order.status === 'rejected' && "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {order.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status === 'pending' && <Clock className="w-3 h-3" />}
                          {order.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {order.status === 'pending' && (
                           <>
                             <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="p-1.5 hover:bg-green-500/20 rounded text-green-400 transition-colors" title="Approve">
                               <CheckCircle2 className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleUpdateStatus(order.id, 'rejected')} className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors" title="Reject">
                               <XCircle className="w-4 h-4" />
                             </button>
                           </>
                        )}
                        <button onClick={() => handleDelete(order.id)} className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="p-6">
              <div className="bg-brand-dark/50 p-6 rounded-xl border border-white/5 mb-8">
                <h3 className="font-bold text-white mb-4">{isEditingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleSaveProduct} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full sm:w-1/3">
                    <label className="text-xs uppercase tracking-widest text-white/50 mb-1 block">Title</label>
                    <input 
                      type="text" 
                      value={productTitle}
                      onChange={e => setProductTitle(e.target.value)}
                      placeholder="e.g. 100 Diamond" 
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label className="text-xs uppercase tracking-widest text-white/50 mb-1 block">Price (৳)</label>
                    <input 
                      type="number" 
                      value={productPrice}
                      onChange={e => setProductPrice(e.target.value)}
                      placeholder="e.g. 85" 
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label className="text-xs uppercase tracking-widest text-white/50 mb-1 block">Category</label>
                    <select 
                      value={productCategory}
                      onChange={e => setProductCategory(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                    >
                      <option value="diamond">UID Topup BD (Diamond)</option>
                      <option value="levelup">Level Up Pass</option>
                      <option value="evo">Evo Access</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-auto flex gap-2">
                    <button type="submit" className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 border border-brand-orange rounded-lg font-bold transition-colors whitespace-nowrap">
                      {isEditingProduct ? 'Update' : 'Add'}
                    </button>
                    {isEditingProduct && (
                      <button type="button" onClick={resetProductForm} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {loadingProducts ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Target Products</h3>
                    <button onClick={handleSeedDefaults} className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-1.5 rounded text-xs font-bold transition-colors">
                      Load Default Catalog
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(prod => (
                    <div key={prod.id} className="bg-brand-dark/30 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide",
                            prod.category === 'diamond' ? "bg-orange-500/20 text-orange-400" :
                            prod.category === 'levelup' ? "bg-cyan-500/20 text-cyan-400" :
                            "bg-purple-500/20 text-purple-400"
                          )}>
                            {prod.category}
                          </span>
                          <span className="font-bold text-white">৳{prod.price}</span>
                        </div>
                        <h4 className="font-bold text-white text-lg">{prod.title}</h4>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-2">
                        <button onClick={() => handleEditProduct(prod)} className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors text-xs flex items-center gap-1">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors text-xs flex items-center gap-1">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/40">No products added yet. Add one above.</div>
                  )}
                </div>
                </>
              )}
            </div>
          )}

          {activeTab !== 'orders' && activeTab !== 'wallet' && activeTab !== 'pricing' && (
             <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center">
               <Settings className="w-12 h-12 mb-4 opacity-20" />
               <p>This module is available in the Pro version.</p>
               <p className="text-xs mt-2">Frontend demo mode is limited to Managing Orders, Wallet, and Pricing.</p>
             </div>
          )}
        </div>
      </div>

    </div>
  );
}
