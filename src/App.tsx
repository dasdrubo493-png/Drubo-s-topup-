/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import MyOrders from './pages/MyOrders';
import Wallet from './pages/Wallet';
import { ToastContainer } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/wallet" element={<Wallet />} />
            </Routes>
          </Layout>
          <ToastContainer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
