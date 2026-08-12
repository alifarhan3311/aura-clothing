import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import BrandsPage from './BrandsPage';
import CategoriesPage from './CategoriesPage';
import CouponsPage from './CouponsPage';
import ProductsPage from './ProductsPage';
import UsersPage from './UsersPage';
import OrdersPage from './OrdersPage';
import { brandApi, categoryApi, productApi, userApi, couponApi, orderApi } from '../../lib/api';
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
function DashboardOverview({ brands, categories, products, coupons, users, orders, loading }) {
  const navigate = useNavigate();

  const totalStock = products.reduce(
    (acc, p) => acc + (p.variants ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) : 0),
    0
  );
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const cancelRequestOrders = orders.filter((o) => o.status === 'cancel_requested').length;
  const totalRevenue = orders
    .filter((o) => !['cancelled', 'rejected'].includes(o.status))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      subtext: `${pendingOrders} pending review`,
      icon: ShoppingCart,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      link: '/admin/orders',
    },
    {
      title: 'Total Products',
      value: products.length,
      subtext: `${totalStock} units in stock`,
      icon: Package,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      link: '/admin/products',
    },
    {
      title: 'Active Brands',
      value: brands.length,
      subtext: `${brands.filter((b) => b.isActive).length} active lines`,
      icon: Tag,
      color: 'bg-[#f0e4cc] text-gray-900 border-[#c9a96e]/30',
      link: '/admin/brands',
    },
    {
      title: 'Categories',
      value: categories.length,
      subtext: 'Men · Women · Kids',
      icon: Layers,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      link: '/admin/categories',
    },
    {
      title: 'Active Coupons',
      value: activeCoupons,
      subtext: `${coupons.length - activeCoupons} expired/draft`,
      icon: Ticket,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      link: '/admin/coupons',
    },
    {
      title: 'Total Users',
      value: users.length,
      subtext: `${users.filter((u) => u.role === 'admin').length} admins`,
      icon: Users,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      link: '/admin/users',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gray-950 p-6 sm:p-8 text-white shadow-xl border border-gray-800"
      >
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a96e]/20 text-[#c9a96e] border border-[#c9a96e]/30 text-xs font-semibold">
            <Sparkles size={14} /> Admin Management Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Manage orders, products, brands, categories, coupons and users — all connected to the live backend.
          </p>
          {/* Revenue quick stat */}
          <div className="flex items-center gap-2 pt-1">
            <TrendingUp size={15} className="text-[#c9a96e]" />
            <span className="text-sm font-bold text-white">
              {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(totalRevenue)}
            </span>
            <span className="text-xs text-gray-400">total revenue (non-cancelled)</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a96e]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(stat.link)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight">
                        {stat.title}
                      </span>
                      <div className={`p-2 rounded-xl border ${stat.color} transition-transform group-hover:scale-110`}>
                        <Icon size={15} />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-medium">{stat.subtext}</span>
                    <ArrowRight size={12} className="text-gray-400 group-hover:text-[#c9a96e] group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Recent Orders</h3>
              <p className="text-xs text-gray-500">Latest orders from customers</p>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold text-[#c9a96e] hover:text-amber-800 flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)
              : orders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate('/admin/orders')}
                    className="p-3 bg-gray-50/70 hover:bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <ShoppingCart size={14} className="text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-gray-900 truncate">
                          {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate font-mono">{order._id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-gray-900">
                        {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(order.total)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.pending}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
            {!loading && orders.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No orders yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Pending + Schema */}
        <div className="space-y-6">

          {/* Pending orders alert */}
          {pendingOrders > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate('/admin/orders')}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-5 cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">{pendingOrders} Pending Order{pendingOrders > 1 ? 's' : ''}</p>
                  <p className="text-xs text-amber-700">Awaiting your review</p>
                </div>
              </div>
              <button className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1">
                Review now <ArrowRight size={12} />
              </button>
            </motion.div>
          )}

          {/* Cancel requests alert */}
          {cancelRequestOrders > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate('/admin/orders')}
              className="bg-orange-50 border border-orange-300 rounded-2xl p-5 cursor-pointer hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-900">{cancelRequestOrders} Cancel Request{cancelRequestOrders > 1 ? 's' : ''}</p>
                  <p className="text-xs text-orange-700">Awaiting approval or rejection</p>
                </div>
              </div>
              <button className="text-xs font-bold text-orange-800 hover:underline flex items-center gap-1">
                Review now <ArrowRight size={12} />
              </button>
            </motion.div>
          )}

          {/* Schema Status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Schema Status</h3>
              <p className="text-xs text-gray-500">Mongoose models · server/src/models</p>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Order.js',    fields: 'items, status, tracking, coupon, history' },
                { name: 'Product.js',  fields: 'name, brand, category, variants[]' },
                { name: 'Category.js', fields: 'name, section (men/women/kids)' },
                { name: 'Coupon.js',   fields: 'code, discountType, products[]' },
                { name: 'User.js',     fields: 'name, email, role, avatar' },
              ].map((model) => (
                <div key={model.name} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#c9a96e] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 font-mono text-[11px]">{model.name}</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">{model.fields}</p>
                  </div>
                </div>
              ))}
            </div>
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
  const [loading, setLoading]       = useState(true);

  const location = useLocation();
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !token) return;

    async function loadAll() {
      setLoading(true);
      try {
        const [bRes, cRes, pRes, couponRes, userRes, orderRes] = await Promise.allSettled([
          brandApi.getAll({ limit: 100 }),
          categoryApi.getAll({ limit: 100 }),
          productApi.getAll({ limit: 100 }),
          couponApi.getAll({ limit: 100 }),
          userApi.getAll({ limit: 100 }),
          orderApi.getAll({ limit: 20 }),
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
      } catch (err) {
        console.warn('Dashboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [token, authLoading]);

  const getActiveTitle = () => {
    if (location.pathname.includes('/orders'))     return 'Orders';
    if (location.pathname.includes('/brands'))     return 'Brands';
    if (location.pathname.includes('/categories')) return 'Categories';
    if (location.pathname.includes('/coupons'))    return 'Coupons';
    if (location.pathname.includes('/products'))   return 'Products';
    if (location.pathname.includes('/users'))      return 'Users';
    return 'Overview';
  };

  const statsCounts = {
    orders:         orders.length,
    cancelRequests: orders.filter((o) => o.status === 'cancel_requested').length,
    brands:         brands.length,
    categories:     categories.length,
    products:       products.length,
    coupons:        coupons.length,
    users:          users.length,
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
        <Route path="users" element={<UsersPage users={users} setUsers={setUsers} />} />
      </Routes>
    </AdminLayout>
  );
}
