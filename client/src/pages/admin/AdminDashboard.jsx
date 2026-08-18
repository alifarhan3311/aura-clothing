import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import BrandsPage from './BrandsPage';
import CategoriesPage from './CategoriesPage';
import CouponsPage from './CouponsPage';
import ProductsPage from './ProductsPage';
import UsersPage from './UsersPage';
import OrdersPage from './OrdersPage';
import HeroSlidesPage from './HeroSlidesPage';
import DepartmentsPage from './DepartmentsPage';
import ContactMessagesPage from './ContactMessagesPage';
import { brandApi, categoryApi, productApi, userApi, couponApi, orderApi, contactApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

import {
  Package,
  Tag,
  Layers,
  Ticket,
  Users,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Loader2,
  Clock,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

// ── Status badge colors (matching OrdersPage) ─────────────────────────────────
const ORDER_STATUS_COLORS = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  dispatched: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
  rejected:   'bg-rose-50 text-rose-800 border-rose-200',
};

// ── Dashboard overview ────────────────────────────────────────────────────────
function DashboardOverview({ brands, categories, products, coupons, users, orders, inquiryStats, loading }) {
  const navigate = useNavigate();

  const totalStock = products.reduce(
    (acc, p) => acc + (p.variants ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) : 0),
    0
  );
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const cancelRequestOrders = orders.filter((o) => o.status === 'cancel_requested').length;
  const pendingInquiries = inquiryStats?.pending || 0;
  const totalRevenue = orders
    .filter((o) => !['cancelled', 'rejected'].includes(o.status))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const stats = [
    {
      title: 'Orders',
      value: orders.length,
      subtext: `${pendingOrders} pending`,
      icon: ShoppingCart,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      link: '/admin/orders',
      alert: pendingOrders > 0,
    },
    {
      title: 'Inquiries',
      value: inquiryStats?.total || 0,
      subtext: `${pendingInquiries} pending`,
      icon: MessageSquare,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      link: '/admin/messages',
      alert: pendingInquiries > 0,
    },
    {
      title: 'Products',
      value: products.length,
      subtext: `${totalStock} in stock`,
      icon: Package,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      link: '/admin/products',
    },
    {
      title: 'Brands',
      value: brands.length,
      subtext: `${brands.filter((b) => b.isActive).length} active`,
      icon: Tag,
      iconBg: 'bg-[#f0e4cc]',
      iconColor: 'text-[#b07d3a]',
      link: '/admin/brands',
    },
    {
      title: 'Categories',
      value: categories.length,
      subtext: 'Men · Women · Kids',
      icon: Layers,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: '/admin/categories',
    },
    {
      title: 'Coupons',
      value: activeCoupons,
      subtext: `${coupons.length} total`,
      icon: Ticket,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      link: '/admin/coupons',
    },
    {
      title: 'Users',
      value: users.length,
      subtext: `${users.filter((u) => u.role === 'admin').length} admins`,
      icon: Users,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      link: '/admin/users',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gray-950 px-6 py-6 sm:px-8 sm:py-7 text-white shadow-lg"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/25 text-[11px] font-bold tracking-wider uppercase">
              <Sparkles size={11} /> Admin Hub
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white">
              Welcome back{users.length > 0 ? '' : ''}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md">
              Full control over orders, products, brands, categories, coupons, and users.
            </p>
          </div>

          {/* Revenue stat */}
          <div className="shrink-0 flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
            <TrendingUp size={18} className="text-[#c9a96e]" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Revenue</p>
              <p className="text-base font-black text-white">
                {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(totalRevenue)}
              </p>
              <p className="text-[10px] text-gray-500">non-cancelled orders</p>
            </div>
          </div>
        </div>

        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c9a96e]/8 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      </motion.div>

      {/* Alert Banners */}
      {(pendingOrders > 0 || cancelRequestOrders > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pendingOrders > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-amber-100 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Clock size={14} className="text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-amber-900">{pendingOrders} Pending Order{pendingOrders > 1 ? 's' : ''}</p>
                <p className="text-[10px] text-amber-700">Awaiting your review</p>
              </div>
              <ArrowRight size={14} className="text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </motion.div>
          )}
          {cancelRequestOrders > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-orange-100 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={14} className="text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-orange-900">{cancelRequestOrders} Cancel Request{cancelRequestOrders > 1 ? 's' : ''}</p>
                <p className="text-[10px] text-orange-700">Awaiting approval or rejection</p>
              </div>
              <ArrowRight size={14} className="text-orange-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </motion.div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          : stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(stat.link)}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={15} className={stat.iconColor} />
                    </div>
                    {stat.alert && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                    )}
                  </div>
                  <div className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.title}</span>
                    <span className="text-[10px] text-gray-400">{stat.subtext}</span>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/40">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Recent Orders</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Latest customer transactions</p>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold text-[#c9a96e] hover:text-amber-800 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 m-4" />)
              : orders.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingCart size={24} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No orders yet.</p>
                </div>
              ) : (
                orders.slice(0, 6).map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate('/admin/orders')}
                    className="px-5 py-3 hover:bg-gray-50 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <ShoppingCart size={12} className="text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-gray-900 truncate">
                          {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">{order._id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-bold text-gray-900">
                        {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(order.total)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.pending}`}>
                        {order.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
          </div>
        </div>

        {/* Schema Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40">
            <h3 className="font-bold text-gray-900 text-sm">Schema Status</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Mongoose models · server/src/models</p>
          </div>
          <div className="p-4 space-y-2">
            {[
              { name: 'Order.js',    fields: 'items, status, tracking, coupon' },
              { name: 'Product.js',  fields: 'name, brand, category, variants[]' },
              { name: 'Category.js', fields: 'name, section (men/women/kids)' },
              { name: 'Coupon.js',   fields: 'code, discountType, products[]' },
              { name: 'User.js',     fields: 'name, email, role, avatar' },
            ].map((model) => (
              <div key={model.name} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 size={13} className="text-[#c9a96e] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-gray-900 font-mono text-[11px] block">{model.name}</span>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">{model.fields}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [brands, setBrands]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts]     = useState([]);
  const [coupons, setCoupons]       = useState([]);
  const [users, setUsers]           = useState([]);
  const [orders, setOrders]         = useState([]);
  const [inquiryStats, setInquiryStats] = useState({ total: 0, pending: 0 });
  const [loading, setLoading]       = useState(true);

  const location = useLocation();
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !token) return;

    async function loadAll() {
      setLoading(true);
      try {
        const [bRes, cRes, pRes, couponRes, userRes, orderRes, inqRes] = await Promise.allSettled([
          brandApi.getAll({ limit: 100 }),
          categoryApi.getAll({ limit: 100 }),
          productApi.getAll({ limit: 100 }),
          couponApi.getAll({ limit: 100 }),
          userApi.getAll({ limit: 100 }),
          orderApi.getAll({ limit: 20 }),
          contactApi.getStats(),
        ]);

        if (bRes.status === 'fulfilled') {
          const d = bRes.value.brands || bRes.value.data || bRes.value;
          if (Array.isArray(d)) setBrands(d);
        }
        if (cRes.status === 'fulfilled') {
          const d = cRes.value.categories || cRes.value.data || cRes.value;
          if (Array.isArray(d)) setCategories(d);
        }
        if (pRes.status === 'fulfilled') {
          const d = pRes.value.products || pRes.value.data || pRes.value;
          if (Array.isArray(d)) setProducts(d);
        }
        if (couponRes.status === 'fulfilled') {
          const d = couponRes.value.coupons || couponRes.value.data || couponRes.value;
          if (Array.isArray(d)) setCoupons(d);
        }
        if (userRes.status === 'fulfilled') {
          const d = userRes.value.users || userRes.value.data || userRes.value;
          if (Array.isArray(d)) setUsers(d);
        }
        if (orderRes.status === 'fulfilled') {
          const d = orderRes.value.orders || orderRes.value.data || orderRes.value;
          if (Array.isArray(d)) setOrders(d);
        }
        if (inqRes.status === 'fulfilled') {
          const s = inqRes.value.stats || inqRes.value;
          if (s) setInquiryStats(s);
        }
      } catch (err) {
        console.warn('Dashboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [token, authLoading]);

  const getActiveTitle = () => {
    if (location.pathname.includes('/orders'))      return 'Orders';
    if (location.pathname.includes('/departments')) return 'Departments';
    if (location.pathname.includes('/brands'))      return 'Brands';
    if (location.pathname.includes('/categories'))  return 'Categories';
    if (location.pathname.includes('/coupons'))     return 'Coupons';
    if (location.pathname.includes('/products'))    return 'Products';
    if (location.pathname.includes('/slides'))      return 'Hero Slides';
    if (location.pathname.includes('/users'))       return 'Users';
    if (location.pathname.includes('/messages'))    return 'Inquiries & Messages';
    return 'Overview';
  };

  const statsCounts = {
    orders:           orders.length,
    cancelRequests:   orders.filter((o) => o.status === 'cancel_requested').length,
    brands:           brands.length,
    categories:       categories.length,
    products:         products.length,
    coupons:          coupons.length,
    users:            users.length,
    inquiries:        inquiryStats.total || 0,
    pendingInquiries: inquiryStats.pending || 0,
  };

  return (
    <AdminLayout activeTitle={getActiveTitle()} statsCounts={statsCounts}>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardOverview
              brands={brands}
              categories={categories}
              products={products}
              coupons={coupons}
              users={users}
              orders={orders}
              inquiryStats={inquiryStats}
              loading={loading}
            />
          }
        />
        <Route path="orders"     element={<OrdersPage />} />
        <Route path="brands"     element={<BrandsPage brands={brands} setBrands={setBrands} />} />
        <Route path="categories" element={<CategoriesPage categories={categories} setCategories={setCategories} />} />
        <Route
          path="coupons"
          element={<CouponsPage coupons={coupons} setCoupons={setCoupons} products={products} />}
        />
        <Route
          path="products"
          element={
            <ProductsPage
              products={products}
              setProducts={setProducts}
              brands={brands}
              categories={categories}
            />
          }
        />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="slides" element={<HeroSlidesPage />} />
        <Route path="users" element={<UsersPage users={users} setUsers={setUsers} />} />
        <Route path="messages" element={<ContactMessagesPage />} />
        <Route path="contact" element={<ContactMessagesPage />} />
      </Routes>
    </AdminLayout>
  );
}
