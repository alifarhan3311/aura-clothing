import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, ShieldCheck, Calendar,
  Edit3, Save, X, Camera, LogOut, Heart, ShoppingBag, Trash2,
  Package, Truck, CheckCircle2, Clock, XCircle, AlertTriangle,
  ChevronRight, Loader2, ExternalLink, Tag, CreditCard, Banknote,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { authApi, orderApi } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const formatPrice = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });

const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  pending:           { label: 'Pending',            color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   Icon: Clock },
  confirmed:         { label: 'Confirmed',           color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    Icon: CheckCircle2 },
  dispatched:        { label: 'Dispatched',          color: 'text-purple-700',  bg: 'bg-purple-50',   border: 'border-purple-200',  Icon: Truck },
  delivered:         { label: 'Delivered',           color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', Icon: Package },
  cancelled:         { label: 'Cancelled',           color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     Icon: XCircle },
  rejected:          { label: 'Rejected',            color: 'text-rose-800',    bg: 'bg-rose-50',     border: 'border-rose-200',    Icon: AlertTriangle },
  cancel_requested:  { label: 'Cancel Requested',    color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  Icon: AlertTriangle },
};

const STATUS_STEPS = ['pending', 'confirmed', 'dispatched', 'delivered'];

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 'lg' }) {
  const dim = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-10 h-10 text-sm';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  if (user?.avatar) {
    return (
      <img
        src={resolveImg(user.avatar)}
        alt={user.name}
        className={`${dim} rounded-full object-cover border-4 border-white shadow-md`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-bold text-white border-4 border-white shadow-md`}>
      {initials}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  const { Icon } = s;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.bg} ${s.color} ${s.border}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
}

// ── Status Timeline ───────────────────────────────────────────────────────────
function StatusTimeline({ status, statusHistory }) {
  const isTerminal = status === 'cancelled' || status === 'rejected';
  const s = STATUS[status] || STATUS.pending;
  const { Icon } = s;

  if (isTerminal) {
    const hist = statusHistory?.slice().reverse().find((h) => h.status === status);
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${s.bg} ${s.border}`}>
        <Icon size={18} className={s.color} />
        <div>
          <p className={`font-bold text-sm ${s.color}`}>Order {s.label}</p>
          {hist?.note && <p className="text-xs text-gray-500 mt-0.5 italic">"{hist.note}"</p>}
          {hist?.changedAt && <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(hist.changedAt)}</p>}
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="relative">
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
      <div className="space-y-3">
        {STATUS_STEPS.map((key, idx) => {
          const step = STATUS[key];
          const StepIcon = step.Icon;
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const hist = statusHistory?.slice().reverse().find((h) => h.status === key);
          return (
            <div key={key} className="flex items-start gap-3 relative">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                done ? `${step.bg} ${step.border} ${step.color}` : 'bg-gray-50 border-gray-200 text-gray-300'
              } ${active ? 'ring-2 ring-offset-1 ring-amber-300' : ''}`}>
                <StepIcon size={14} />
              </div>
              <div className="pt-1 flex-1">
                <p className={`text-xs font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                {hist && (
                  <>
                    <p className="text-[10px] text-gray-400">{formatDateTime(hist.changedAt)}</p>
                    {hist.note && <p className="text-[10px] text-gray-500 italic">"{hist.note}"</p>}
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
  const [submitting, setSubmitting] = useState(false);

  const REASONS = [
    'Changed my mind',
    'Ordered by mistake',
    'Found a better price elsewhere',
    'Delivery time too long',
    'Wrong item selected',
    'Other',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      const res = await orderApi.cancel(order._id, reason);
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
          {/* Header */}
          <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Request Cancellation</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Your request will be sent to admin for review
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Order snippet */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <p className="font-mono text-gray-400 truncate">{order._id}</p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {order.items?.[0]?.name}
                {order.items?.length > 1 && ` +${order.items.length - 1} more`}
              </p>
            </div>

            {/* Reason select */}
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

            {/* Additional notes if "Other" */}
            {reason === 'Other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <textarea
                  rows={3}
                  placeholder="Please describe your reason…"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-red-400 transition-colors resize-none"
                  onChange={(e) => setReason(e.target.value)}
                />
              </motion.div>
            )}

            {/* Info note */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              ⚠️ Your order will <strong>not</strong> be cancelled immediately. Admin will review your request and confirm within 24 hours.
            </div>

            {/* Buttons */}
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
                disabled={!reason.trim() || submitting}
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
function OrderDetailModal({ order, onClose, onCancelled }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();
  const canRequestCancel = ['pending', 'confirmed'].includes(order.status);
  const alreadyRequested = order.status === 'cancel_requested';

  return (
    <>
      <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Order Details</h2>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{order._id}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* Tracking number */}
            {order.trackingNumber && (
              <div className="bg-gray-900 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
                <p className="text-lg font-black text-amber-400 font-mono tracking-widest">{order.trackingNumber}</p>
                <button
                  onClick={() => { onClose(); navigate(`/track/${order.trackingNumber}`); }}
                  className="mt-2 text-[11px] text-amber-300 hover:text-amber-200 underline flex items-center gap-1 mx-auto"
                >
                  <ExternalLink size={11} /> Track this order
                </button>
              </div>
            )}

            {/* Status timeline */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">Order Progress</p>
              <StatusTimeline status={order.status} statusHistory={order.statusHistory} />
            </div>

            {/* Items */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Items ({order.items?.length})
              </p>
              {order.items?.map((item) => (
                <div key={item._id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  {item.image ? (
                    <img
                      src={resolveImg(item.image)}
                      alt={item.name}
                      className="w-12 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-14 rounded-lg bg-gray-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                      {item.selectedColor ? ` · ${item.selectedColor}` : ''}
                      {` · Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-gray-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 text-xs">
                  <span className="flex items-center gap-1">
                    <Tag size={11} /> Coupon ({order.couponCode})
                  </span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Shipping ({order.shippingMethod})</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-amber-700">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Payment + Delivery */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Payment</p>
                <div className="flex items-center gap-1.5">
                  {order.paymentMethod === 'cod'
                    ? <Banknote size={13} className="text-amber-600" />
                    : <CreditCard size={13} className="text-blue-600" />}
                  <span className="text-xs font-semibold text-gray-800">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Delivery</p>
                <div className="flex items-center gap-1.5">
                  <Truck size={13} className="text-purple-600" />
                  <span className="text-xs font-semibold text-gray-800 capitalize">
                    {order.shippingMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs space-y-1 text-gray-600">
              <p className="font-bold text-gray-800">
                {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}
              </p>
              <p>{order.shippingInfo?.address}</p>
              <p>
                {order.shippingInfo?.city}, {order.shippingInfo?.postalCode},{' '}
                {order.shippingInfo?.country}
              </p>
              <p>{order.shippingInfo?.phone}</p>
            </div>

            {/* Cancel / Cancel-request section */}
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
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                <XCircle size={15} />
                Request Cancellation
              </button>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    {/* Cancel Request Modal */}
    {showCancelModal && (
      <CancelRequestModal
        order={order}
        onClose={() => setShowCancelModal(false)}
        onRequested={(updatedOrder) => {
          setShowCancelModal(false);
          onCancelled(updatedOrder);
        }}
      />
    )}
    </>
  );
}
// ── Main Profile Page ─────────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout, saveSession } = useAuth();
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Orders
  const [orders, setOrders]             = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
  });

  const fetchOrders = useCallback(async () => {
    if (ordersFetched) return;
    setOrdersLoading(true);
    try {
      const res  = await orderApi.getMy({ limit: 50 });
      const data = res.orders || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
      setOrdersFetched(true);
    } catch {
      toast.error('Could not load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [ordersFetched]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, fetchOrders]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',    form.name);
      fd.append('phone',   form.phone);
      fd.append('address', form.address);
      if (avatarFile) fd.append('avatar', avatarFile);
      const res = await authApi.updateProfile(fd);
      saveSession(null, res.user);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile updated!', {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
      });
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setForm({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Header card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-5"
        >
          <div className="h-28 bg-gradient-to-r from-gray-900 via-gray-800 to-amber-900" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                {editing ? (
                  <label className="cursor-pointer group">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                      {avatarPreview || user?.avatar ? (
                        <img
                          src={avatarPreview || resolveImg(user?.avatar)}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-bold text-white text-3xl">
                          {(user?.name?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-white" />
                      </div>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                ) : (
                  <Avatar user={user} size="lg" />
                )}
              </div>

              <div className="flex gap-2 mb-1">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                    >
                      <X size={13} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-60"
                    >
                      <Save size={13} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <Edit3 size={13} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="text-xl font-bold text-gray-900 border-b-2 border-amber-400 focus:outline-none bg-transparent w-full mb-1"
                placeholder="Your name"
              />
            ) : (
              <h1 className="text-xl font-bold text-gray-900 mb-0.5">{user?.name || '—'}</h1>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                user?.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <ShieldCheck size={10} />
                {user?.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-100">
            {[
              { id: 'profile',  label: 'Profile',                         icon: <User size={13} /> },
              { id: 'wishlist', label: `Wishlist (${wishlist.length})`,    icon: <Heart size={13} /> },
              { id: 'orders',   label: 'My Orders',                       icon: <ShoppingBag size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Tab Content ── */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* ─── PROFILE ─────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-5 space-y-5">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Account Details</h2>

                {[
                  { icon: Mail,    label: 'Email',   field: null,      value: user?.email },
                  { icon: Phone,   label: 'Phone',   field: 'phone',   value: user?.phone },
                  { icon: MapPin,  label: 'Address', field: 'address', value: user?.address, textarea: true },
                ].map(({ icon: Icon, label, field, value, textarea }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                      {editing && field ? (
                        textarea ? (
                          <textarea
                            name={field}
                            value={form[field]}
                            onChange={handleChange}
                            rows={2}
                            className="w-full text-sm border-b border-gray-200 focus:border-amber-400 focus:outline-none py-0.5 bg-transparent text-gray-900 resize-none"
                            placeholder={`Your ${label.toLowerCase()}`}
                          />
                        ) : (
                          <input
                            name={field}
                            value={form[field]}
                            onChange={handleChange}
                            className="w-full text-sm border-b border-gray-200 focus:border-amber-400 focus:outline-none py-0.5 bg-transparent text-gray-900"
                            placeholder={`Your ${label.toLowerCase()}`}
                          />
                        )
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          {value || <span className="text-gray-400 italic">Not set</span>}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {joinedDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Calendar size={15} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Member Since</p>
                      <p className="text-sm font-medium text-gray-900">{joinedDate}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}

          {/* ─── WISHLIST ─────────────────────────────────────── */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Saved Items</h2>
                {wishlist.length > 0 && (
                  <button
                    onClick={clearWishlist}
                    className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    <Trash2 size={13} /> Clear All
                  </button>
                )}
              </div>

              {wishlist.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <Heart size={40} className="text-gray-200" />
                  <p className="text-sm text-gray-400 font-medium">Your wishlist is empty</p>
                  <Link to="/women" className="mt-1 text-xs font-bold text-amber-700 hover:underline">
                    Browse products →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlist.map((product) => {
                    const pid = product._id || product.id;
                    const img = resolveImg(product.mainImage || product.image);
                    const firstVariant = product.variants?.[0];
                    const price = firstVariant?.price ?? 0;
                    const disc  = firstVariant?.discount ?? 0;
                    const displayPrice = disc > 0 ? Math.round(price * (1 - disc / 100)) : price;
                    return (
                      <div key={pid} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <Link to={`/product/${pid}`} className="shrink-0">
                          {img ? (
                            <img src={img} alt={product.name} className="w-16 h-20 rounded-xl object-cover bg-gray-50" />
                          ) : (
                            <div className="w-16 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                              <ShoppingBag size={20} className="text-gray-300" />
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${pid}`} className="text-sm font-semibold text-gray-900 hover:text-amber-700 line-clamp-2">
                            {product.name}
                          </Link>
                          {product.brand?.name && (
                            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">{product.brand.name}</p>
                          )}
                          {price > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-bold text-gray-900">
                                {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(displayPrice)}
                              </span>
                              {disc > 0 && (
                                <span className="text-xs text-gray-400 line-through">
                                  {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── ORDERS ───────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">My Orders</h2>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-amber-500" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <ShoppingBag size={40} className="text-gray-200" />
                  <p className="text-sm text-gray-400 font-medium">No orders yet</p>
                  <Link to="/" className="mt-1 text-xs font-bold text-amber-700 hover:underline">
                    Start Shopping →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const firstItem = order.items?.[0];
                    return (
                      <motion.button
                        key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full text-left p-4 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {firstItem?.image ? (
                            <img
                              src={resolveImg(firstItem.image)}
                              alt={firstItem.name}
                              className="w-14 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                              <ShoppingBag size={20} className="text-gray-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <p className="text-[10px] font-mono text-gray-400 truncate">{order._id}</p>
                              <StatusBadge status={order.status} />
                            </div>
                            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                              {order.items?.length === 1
                                ? firstItem?.name
                                : `${firstItem?.name} +${order.items.length - 1} more`}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                              <p className="text-xs font-bold text-gray-900">{formatPrice(order.total)}</p>
                            </div>
                            {order.trackingNumber && (
                              <p className="text-[10px] text-amber-700 font-mono font-bold mt-1">
                                🚚 {order.trackingNumber}
                              </p>
                            )}
                          </div>
                          <ChevronRight size={15} className="text-gray-300 group-hover:text-amber-500 shrink-0 transition-colors" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancelled={(updated) => {
            setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
            setSelectedOrder(updated);
          }}
        />
      )}
    </main>
  );
}
