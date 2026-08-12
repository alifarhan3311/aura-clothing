import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Truck, CheckCircle2, XCircle, Clock, Search,
  MapPin, Phone, Mail, Loader2, AlertCircle, Tag,
  CreditCard, Banknote, AlertTriangle, X, ChevronRight,
} from 'lucide-react';
import { orderApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

const formatDate = (d) =>
  new Date(d).toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',  Icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  { key: 'confirmed',  label: 'Confirmed',     Icon: CheckCircle2, color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  { key: 'dispatched', label: 'Dispatched',    Icon: Truck,        color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200' },
  { key: 'delivered',  label: 'Delivered',     Icon: Package,      color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const STATUS_MAP = {
  pending:          { label: 'Pending',           color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200',  Icon: Clock },
  confirmed:        { label: 'Confirmed',          color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',   Icon: CheckCircle2 },
  dispatched:       { label: 'Dispatched',         color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200', Icon: Truck },
  delivered:        { label: 'Delivered',          color: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200',Icon: Package },
  cancelled:        { label: 'Cancelled',          color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200',    Icon: XCircle },
  rejected:         { label: 'Rejected',           color: 'text-rose-800',   bg: 'bg-rose-50',    border: 'border-rose-200',   Icon: AlertTriangle },
  cancel_requested: { label: 'Cancel Requested',   color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200', Icon: AlertTriangle },
};

const TERMINAL_KEYS = ['cancelled', 'rejected', 'cancel_requested'];

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  const { Icon } = s;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.bg} ${s.color} ${s.border}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function StatusTimeline({ status, statusHistory }) {
  const isTerminal = TERMINAL_KEYS.includes(status);

  if (isTerminal) {
    const s = STATUS_MAP[status];
    const { Icon } = s;
    const hist = statusHistory?.slice().reverse().find((h) => h.status === status);
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${s.bg} ${s.border}`}>
        <Icon size={20} className={s.color} />
        <div>
          <p className={`font-bold text-sm ${s.color}`}>Order {s.label}</p>
          {hist?.note && <p className="text-xs text-gray-500 mt-0.5 italic">"{hist.note}"</p>}
          {hist?.changedAt && <p className="text-xs text-gray-400 mt-0.5">{formatDate(hist.changedAt)}</p>}
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="relative">
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
      <div className="space-y-4">
        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const { Icon } = step;
          const hist = statusHistory?.slice().reverse().find((h) => h.status === step.key);
          return (
            <div key={step.key} className="flex items-start gap-4 relative">
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                done ? `${step.bg} ${step.border} ${step.color}` : 'bg-gray-50 border-gray-200 text-gray-300'
              } ${active ? 'ring-2 ring-offset-2 ring-amber-300' : ''}`}>
                <Icon size={18} />
              </div>
              <div className="pt-1.5 flex-1">
                <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {hist && (
                  <>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(hist.changedAt)}</p>
                    {hist.note && <p className="text-xs text-gray-500 mt-0.5 italic">"{hist.note}"</p>}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Cancel Request Modal ──────────────────────────────────────────────────────
function CancelRequestModal({ order, onClose, onRequested }) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const REASONS = [
    'Changed my mind',
    'Ordered by mistake',
    'Found a better price elsewhere',
    'Delivery time too long',
    'Wrong item selected',
    'Other',
  ];

  const finalReason = reason === 'Other' ? customReason : reason;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!finalReason.trim()) return;
    setSubmitting(true);
    try {
      const res = await orderApi.cancel(order._id, finalReason.trim());
      toast.success('Cancel request submitted! Admin will review shortly.', {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
        duration: 5000,
      });
      onRequested(res.order);
    } catch (err) {
      toast.error(err.message || 'Could not submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Request Cancellation</h3>
              <p className="text-xs text-gray-500 mt-0.5">Your request will be sent to admin for review</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <p className="font-mono text-gray-400 truncate">{order.trackingNumber || order._id}</p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {order.items?.[0]?.name}
                {order.items?.length > 1 && ` +${order.items.length - 1} more`}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                Reason <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    reason === r ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-red-500"
                    />
                    <span className="text-sm text-gray-700">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {reason === 'Other' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please describe your reason…"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-red-400 transition-colors resize-none"
                />
              </motion.div>
            )}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              ⚠️ Your order will <strong>not</strong> be cancelled immediately. Admin will review your request within 24 hours.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="submit"
                disabled={!finalReason.trim() || submitting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrderTracking() {
  const { trackingNumber: paramTracking } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [inputTracking, setInputTracking] = useState(paramTracking || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = async (tn) => {
    if (!tn?.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await orderApi.track(tn.trim().toUpperCase());
      setOrder(res.order);
    } catch (err) {
      setError(err.message || 'Order not found. Please check your tracking number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramTracking) fetchOrder(paramTracking);
  }, [paramTracking]);

  const handleSearch = (e) => {
    e.preventDefault();
    const tn = inputTracking.trim().toUpperCase();
    navigate(`/track/${tn}`, { replace: true });
    fetchOrder(tn);
  };

  const isOwner = isAuthenticated && order &&
    order.shippingInfo?.email?.toLowerCase() === user?.email?.toLowerCase();
  const canRequestCancel = isOwner && ['pending', 'confirmed'].includes(order?.status);
  const alreadyRequested = order?.status === 'cancel_requested';

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pb-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
              <Truck size={24} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              Track Your Order
            </h1>
            <p className="text-gray-400 text-sm">Enter your tracking number to see real-time order status</p>
            {!isAuthenticated && (
              <p className="text-xs text-amber-700 mt-2">
                <Link to="/login" className="font-bold underline">Login</Link> to request cancellations.
              </p>
            )}
          </motion.div>

          {/* ── Search box ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={inputTracking}
                  onChange={(e) => setInputTracking(e.target.value.toUpperCase())}
                  placeholder="e.g. MH-20260813-A4B2C1"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 transition-colors font-mono uppercase placeholder:font-sans placeholder:normal-case"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !inputTracking.trim()}
                className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                Track
              </button>
            </form>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-amber-500" />
            </div>
          )}

          {/* ── Error ── */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
            >
              <AlertCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* ── Order result ── */}
          {order && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Tracking number card */}
              <div className="bg-gray-900 rounded-3xl p-5 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
                <p className="text-xl font-black text-amber-400 font-mono tracking-widest">{order.trackingNumber}</p>
                <p className="text-[11px] text-gray-500 mt-1.5">Placed on {formatDate(order.createdAt)}</p>
                <div className="mt-3 flex justify-center">
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Status timeline */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5">Order Progress</h2>
                <StatusTimeline status={order.status} statusHistory={order.statusHistory} />
              </div>

              {/* Items */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Items Ordered ({order.items?.length})
                </h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                      {item.image ? (
                        <img
                          src={resolveImg(item.image)}
                          alt={item.name}
                          className="w-12 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-14 rounded-xl bg-gray-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                          {item.selectedColor && ` · ${item.selectedColor}`}
                          {` · Qty: ${item.quantity}`}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 text-xs">
                      <span className="flex items-center gap-1"><Tag size={11} /> Coupon ({order.couponCode})</span>
                      <span>−{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Shipping ({order.shippingMethod})</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-sm">
                    <span>Total</span><span className="text-amber-700">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment + Delivery */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Payment</p>
                  <div className="flex items-center gap-2">
                    {order.paymentMethod === 'cod'
                      ? <Banknote size={14} className="text-amber-600" />
                      : <CreditCard size={14} className="text-blue-600" />}
                    <span className="text-xs font-semibold text-gray-800">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Delivery</p>
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-purple-600" />
                    <span className="text-xs font-semibold text-gray-800 capitalize">{order.shippingMethod}</span>
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Delivery Address</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-gray-600">
                      <p className="font-semibold text-gray-800">
                        {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                      </p>
                      <p className="text-xs mt-0.5">{order.shippingInfo.address}</p>
                      <p className="text-xs">{order.shippingInfo.city}, {order.shippingInfo.postalCode}, {order.shippingInfo.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-xs">
                    <Phone size={13} className="text-amber-600 shrink-0" />
                    <span>{order.shippingInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-xs">
                    <Mail size={13} className="text-amber-600 shrink-0" />
                    <span>{order.shippingInfo.email}</span>
                  </div>
                </div>
              </div>

              {/* ── Cancel section ── */}
              {alreadyRequested && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
                  <AlertTriangle size={16} className="text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800">Cancellation Requested</p>
                    <p className="text-xs text-orange-700 mt-0.5">
                      Your request is under review. Admin will respond within 24 hours.
                    </p>
                    {order.cancelReason && (
                      <p className="text-xs text-orange-600 mt-1 italic">Reason: "{order.cancelReason}"</p>
                    )}
                  </div>
                </div>
              )}

              {canRequestCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-red-200 text-red-600 rounded-2xl text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                  <XCircle size={16} />
                  Request Cancellation
                </button>
              )}

              {!isAuthenticated && !['delivered', 'cancelled', 'rejected', 'cancel_requested'].includes(order.status) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-center text-amber-800">
                  <Link to={`/login?redirect=/track/${order.trackingNumber}`} className="font-bold underline">
                    Login
                  </Link>{' '}
                  to request cancellation.
                </div>
              )}

              {isOwner && !canRequestCancel && !alreadyRequested && !['delivered', 'cancelled', 'rejected'].includes(order.status) && (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-center text-gray-400">
                  Order cannot be cancelled — it has already been {order.status}.
                </div>
              )}

              {/* bottom padding */}
              <div className="h-4" />
            </motion.div>
          )}

        </div>
      </div>

      {/* Cancel Request Modal */}
      {showCancelModal && order && (
        <CancelRequestModal
          order={order}
          onClose={() => setShowCancelModal(false)}
          onRequested={(updatedOrder) => {
            setShowCancelModal(false);
            setOrder(updatedOrder);
          }}
        />
      )}
    </main>
  );
}
