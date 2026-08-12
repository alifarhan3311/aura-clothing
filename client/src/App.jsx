import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Women from './pages/Women';
import Men from './pages/Men';
import Kids from './pages/Kids';
import HomeCatalog from './pages/HomeCatalog';
import ProductDetail from './pages/ProductDetail';
import VerifyOtp from './pages/VerifyOtp';
import CategoryProducts from './pages/CategoryProducts';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';

import AdminDashboard from './pages/admin/AdminDashboard';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

// ── Admin Route Guard ─────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-medium">Authenticating…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const hideFooter = isAdminRoute || ['/login', '/register', '/verify-otp'].includes(location.pathname);

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.startsWith('/admin') ? 'admin' : location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/women" element={<PageWrapper><Women /></PageWrapper>} />
          <Route path="/men" element={<PageWrapper><Men /></PageWrapper>} />
          <Route path="/kids" element={<PageWrapper><Kids /></PageWrapper>} />
          <Route path="/home-decor" element={<PageWrapper><HomeCatalog /></PageWrapper>} />
          <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
          <Route path="/category/:id" element={<PageWrapper><CategoryProducts /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/verify-otp" element={<PageWrapper><VerifyOtp /></PageWrapper>} />
          <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
          <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="/track" element={<PageWrapper><OrderTracking /></PageWrapper>} />
          <Route path="/track/:trackingNumber" element={<PageWrapper><OrderTracking /></PageWrapper>} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <PageWrapper><AdminDashboard /></PageWrapper>
              </AdminRoute>
            }
          />
        </Routes>
      </AnimatePresence>
      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: { fontFamily: 'Inter, sans-serif' },
              }}
            />
            <AppRoutes />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
