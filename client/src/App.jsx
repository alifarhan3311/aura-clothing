import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname, search]);
  return null;
}

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home          from './pages/Home';
import Shop           from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CategoryRedirect from './pages/CategoryRedirect';
import About         from './pages/About';
import Contact       from './pages/Contact';
import Login         from './pages/Login';
import Register      from './pages/Register';
import VerifyOtp     from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Profile       from './pages/Profile';
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

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

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
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (!isAdmin)          return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const location     = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const hideFooter   = isAdminRoute || ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'].includes(location.pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes
          location={location}
          key={location.pathname.startsWith('/admin') ? 'admin' : location.pathname}
        >
          <Route path="/"            element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/shop"        element={<PageWrapper><Shop /></PageWrapper>} />
          <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />

          {/* Redirect old section routes to shop */}
          <Route path="/women"       element={<Navigate to="/shop?section=women" replace />} />
          <Route path="/men"         element={<Navigate to="/shop?section=men" replace />} />
          <Route path="/kids"        element={<Navigate to="/shop?section=kids" replace />} />
          <Route path="/home-decor"  element={<Navigate to="/shop" replace />} />

          {/* /category/:id → redirect to /:section?category=:id */}
          <Route path="/category/:id" element={<CategoryRedirect />} />

          <Route path="/about"    element={<PageWrapper><About /></PageWrapper>} />
          <Route path="/contact"  element={<PageWrapper><Contact /></PageWrapper>} />
          <Route path="/login"    element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/verify-otp" element={<PageWrapper><VerifyOtp /></PageWrapper>} />
          <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
          <Route path="/reset-password"  element={<PageWrapper><ForgotPassword /></PageWrapper>} />
          <Route path="/cart"     element={<PageWrapper><Cart /></PageWrapper>} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <PageWrapper><Checkout /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageWrapper><Profile /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route path="/track"    element={<PageWrapper><OrderTracking /></PageWrapper>} />
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
              gutter={10}
              containerStyle={{ zIndex: 99999, bottom: 24, right: 24 }}
              toastOptions={{
                duration: 3500,
                style: {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: '#111111',
                  color: '#f5f5f5',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                  maxWidth: '360px',
                },
                success: {
                  iconTheme: { primary: '#c9a96e', secondary: '#111111' },
                },
                error: {
                  duration: 4500,
                  iconTheme: { primary: '#f87171', secondary: '#111111' },
                  style: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: '#111111',
                    color: '#f5f5f5',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    border: '1px solid rgba(248,113,113,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                    maxWidth: '360px',
                  },
                },
              }}
            />
            <AppRoutes />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
