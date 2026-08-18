import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, ShieldCheck, Calendar,
  Edit3, Save, X, Camera, LogOut, Heart, ShoppingBag, Trash2,
  Package, Truck, CheckCircle2, Clock, XCircle, AlertTriangle,
  ChevronRight, Loader2, ExternalLink, Tag, CreditCard, Banknote,
  MessageSquare, Send, ArrowRight, LayoutDashboard, Plus,
  Check, RefreshCw, Sparkles, Filter, Globe, Building2, MapPinned,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { authApi, orderApi, contactApi } from '../lib/api';

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

// ── Order Status Config ───────────────────────────────────────────────────────
const ORDER_STATUS = {
  pending:           { label: 'Pending',            color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   Icon: Clock },
  confirmed:         { label: 'Confirmed',           color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    Icon: CheckCircle2 },
  dispatched:        { label: 'Dispatched',          color: 'text-purple-700',  bg: 'bg-purple-50',   border: 'border-purple-200',  Icon: Truck },
  delivered:         { label: 'Delivered',           color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', Icon: Package },
  cancelled:         { label: 'Cancelled',           color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     Icon: XCircle },
  rejected:          { label: 'Rejected',            color: 'text-rose-800',    bg: 'bg-rose-50',     border: 'border-rose-200',    Icon: AlertTriangle },
  cancel_requested:  { label: 'Cancel Requested',    color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  Icon: AlertTriangle },
};

const ORDER_STATUS_STEPS = ['pending', 'confirmed', 'dispatched', 'delivered'];

// ── Contact Inquiry Status Config ─────────────────────────────────────────────
const CONTACT_STATUS = {
  pending:     { label: 'Pending',     color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   Icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    Icon: RefreshCw },
  completed:   { label: 'Completed',   color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', Icon: CheckCircle2 },
  resolved:    { label: 'Completed',   color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', Icon: CheckCircle2 },
  rejected:    { label: 'Rejected',    color: 'text-rose-700',    bg: 'bg-rose-50',     border: 'border-rose-200',    Icon: XCircle },
  closed:      { label: 'Closed',      color: 'text-gray-600',    bg: 'bg-gray-100',    border: 'border-gray-200',    Icon: XCircle },
};

// ── Avatar Component ──────────────────────────────────────────────────────────
function Avatar({ user, size = 'lg' }) {
  const dim = size === 'lg' ? 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl' : 'w-10 h-10 text-sm';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  if (user?.avatar) {
    return (
      <img
        src={resolveImg(user.avatar)}
        alt={user.name}
        className={`${dim} rounded-2xl object-cover border-4 border-white shadow-md`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-bold text-white border-4 border-white shadow-md`}>
      {initials}
    </div>
  );
}

// ── Status Badges ─────────────────────────────────────────────────────────────
function OrderStatusBadge({ status }) {
  const s = ORDER_STATUS[status] || ORDER_STATUS.pending;
  const { Icon } = s;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.color} ${s.border}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
}

function ContactStatusBadge({ status }) {
  const s = CONTACT_STATUS[status] || CONTACT_STATUS.pending;
  const { Icon } = s;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.color} ${s.border}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
}

// ── Status Timeline for Orders ────────────────────────────────────────────────
function StatusTimeline({ status, statusHistory }) {
  const isTerminal = status === 'cancelled' || status === 'rejected';
  const s = ORDER_STATUS[status] || ORDER_STATUS.pending;
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

  const currentIdx = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <div className="relative">
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
      <div className="space-y-3">
        {ORDER_STATUS_STEPS.map((key, idx) => {
          const step = ORDER_STATUS[key];
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
              <p className="font-mono text-gray-400 truncate">{order._id}</p>
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
                  placeholder="Please describe your reason…"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-red-400 transition-colors resize-none"
                  onChange={(e) => setReason(e.target.value)}
                />
              </motion.div>
            )}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              ⚠️ Your order will not be cancelled immediately. Admin will review and confirm within 24 hours.
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

// ── Order Detail Modal ────────────────────────────────────────────────────────
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
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Order Details</h2>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{order._id}</p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
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

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">Order Progress</p>
                <StatusTimeline status={order.status} statusHistory={order.statusHistory} />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Items ({order.items?.length})</p>
                {order.items?.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    {item.image ? (
                      <img src={resolveImg(item.image)} alt={item.name} className="w-12 h-14 rounded-lg object-cover border border-gray-200 shrink-0" />
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
                    <p className="text-xs font-bold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
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
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-amber-700">{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Payment</p>
                  <div className="flex items-center gap-1.5">
                    {order.paymentMethod === 'cod' ? <Banknote size={13} className="text-amber-600" /> : <CreditCard size={13} className="text-blue-600" />}
                    <span className="text-xs font-semibold text-gray-800">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Delivery</p>
                  <div className="flex items-center gap-1.5">
                    <Truck size={13} className="text-purple-600" />
                    <span className="text-xs font-semibold text-gray-800 capitalize">{order.shippingMethod}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs space-y-1 text-gray-600">
                <p className="font-bold text-gray-800">{order.shippingInfo?.firstName} {order.shippingInfo?.lastName}</p>
                <p>{order.shippingInfo?.address}</p>
                <p>{order.shippingInfo?.city}, {order.shippingInfo?.postalCode}, {order.shippingInfo?.country}</p>
                <p>{order.shippingInfo?.phone}</p>
              </div>

              {alreadyRequested && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
                  <AlertTriangle size={16} className="text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800">Cancellation Requested</p>
                    <p className="text-xs text-orange-700 mt-0.5">Your request is under review. Admin will respond within 24 hours.</p>
                    {order.cancelReason && <p className="text-xs text-orange-600 mt-1 italic">Reason: "{order.cancelReason}"</p>}
                  </div>
                </div>
              )}

              {canRequestCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                  <XCircle size={15} /> Request Cancellation
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

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

// ── New Inquiry Quick Modal (Inside User Dashboard) ───────────────────────────
function NewInquiryModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in Name, Email, and Message.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await contactApi.submit(form);
      toast.success('Inquiry submitted! You will receive updates via email.', {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
      });
      onCreated(res.contact);
    } catch (err) {
      toast.error(err.message || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <div className="bg-[#f7f3ee] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">New Support Inquiry</h3>
              <p className="text-xs text-gray-500">Ask a question or request assistance</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200/50 flex items-center justify-center">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 block">Your Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 block">Subject</label>
              <input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="E.g. Size exchange, Order query..."
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 block">Message</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                required
                placeholder="How can our customer service team help you?"
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-amber-600 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-amber-700 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                {submitting ? 'Sending…' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Profile & Dashboard Page ─────────────────────────────────────────────
export default function Profile() {
  const { user, logout, saveSession } = useAuth();
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Orders state
  const [orders, setOrders]               = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFilter, setOrderFilter]     = useState('all');

  // Contact inquiries state
  const [inquiries, setInquiries]               = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesFetched, setInquiriesFetched] = useState(false);
  const [showNewInquiryModal, setShowNewInquiryModal] = useState(false);
  const [expandedInquiryId, setExpandedInquiryId] = useState(null);

  const getInitialForm = (u) => {
    const fName = u?.firstName || u?.name?.split(' ')[0] || '';
    const lName = u?.lastName || u?.name?.split(' ').slice(1).join(' ') || '';
    const userAddr = u?.address || {};
    const street = typeof userAddr === 'string' ? userAddr : (userAddr.street || '');
    const city = userAddr.city || '';
    const state = userAddr.state || '';
    const postalCode = userAddr.postalCode || userAddr.zip || '';
    const country = userAddr.country || 'Pakistan';

    return {
      firstName: fName,
      lastName: lName,
      name: u?.name || `${fName} ${lName}`.trim(),
      phone: u?.phone || '',
      street,
      city,
      state,
      zip: postalCode,
      country,
    };
  };

  // Form matching all User fields (except role)
  const [form, setForm] = useState(getInitialForm(user));

  // Keep form in sync when user updates
  useEffect(() => {
    if (user) {
      setForm(getInitialForm(user));
    }
  }, [user]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (ordersFetched) return;
    setOrdersLoading(true);
    try {
      const res = await orderApi.getMy({ limit: 50 });
      const data = res.orders || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
      setOrdersFetched(true);
    } catch {
      toast.error('Could not load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [ordersFetched]);

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    if (inquiriesFetched) return;
    setInquiriesLoading(true);
    try {
      const res = await contactApi.getMy();
      const data = res.contacts || res.data || [];
      setInquiries(Array.isArray(data) ? data : []);
      setInquiriesFetched(true);
    } catch {
      toast.error('Could not load inquiries');
    } finally {
      setInquiriesLoading(false);
    }
  }, [inquiriesFetched]);

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'orders') fetchOrders();
    if (activeTab === 'overview' || activeTab === 'inquiries') fetchInquiries();
  }, [activeTab, fetchOrders, fetchInquiries]);

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
      fd.append('firstName', form.firstName.trim());
      fd.append('lastName', form.lastName.trim());
      fd.append('name', `${form.firstName.trim()} ${form.lastName.trim()}`.trim());
      fd.append('phone', form.phone.trim());
      fd.append('street', form.street.trim());
      fd.append('city', form.city.trim());
      fd.append('state', form.state.trim());
      fd.append('zip', form.zip.trim());
      fd.append('postalCode', form.zip.trim());
      fd.append('country', form.country.trim() || 'Pakistan');
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await authApi.updateProfile(fd);
      saveSession(null, res.user);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile updated successfully!', {
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
    setForm(getInitialForm(user));
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const activeOrdersCount = orders.filter((o) => ['pending', 'confirmed', 'dispatched'].includes(o.status)).length;
  const pendingInquiriesCount = inquiries.filter((i) => i.status === 'pending').length;

  return (
    <main className="min-h-screen bg-[#faf8f5] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Top Dashboard Header Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-200/70 overflow-hidden"
        >
          {/* Cover decorative header banner */}
          <div className="h-28 sm:h-32 bg-gradient-to-r from-gray-950 via-gray-900 to-amber-950 px-6 sm:px-8 py-5 flex items-start justify-between relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-[11px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={11} /> Customer Dashboard
              </span>
            </div>
            <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* User info row below banner */}
          <div className="px-6 sm:px-8 pt-4 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              {/* Avatar + Name + Email */}
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                <div className="relative shrink-0">
                  {editing ? (
                    <label className="cursor-pointer group block">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-300 shadow-md overflow-hidden bg-gray-100 relative">
                        {avatarPreview || user?.avatar ? (
                          <img
                            src={avatarPreview || resolveImg(user?.avatar)}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-bold text-white text-2xl">
                            {(user?.name?.[0] || 'U').toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={18} className="text-white" />
                        </div>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  ) : (
                    <Avatar user={user} size="lg" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {editing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">First Name</label>
                        <input
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          className="text-xs sm:text-sm font-bold text-gray-900 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:border-amber-500 outline-none bg-gray-50/50 w-full"
                          placeholder="Sara"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Last Name</label>
                        <input
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          className="text-xs sm:text-sm font-bold text-gray-900 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:border-amber-500 outline-none bg-gray-50/50 w-full"
                          placeholder="Ahmed"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                        {user?.name || `${form.firstName} ${form.lastName}`.trim() || 'Customer'}
                      </h1>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons (Right aligned) */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      <X size={13} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gray-950 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-60"
                    >
                      <Save size={13} /> {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setEditing(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
                  >
                    <Edit3 size={13} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Badges & Meta Info */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                user?.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
              }`}>
                <ShieldCheck size={11} />
                {user?.role === 'admin' ? 'Administrator' : 'Customer Account'}
              </span>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ Email Verified
                </span>
              )}
              {joinedDate && (
                <span className="text-gray-400 text-[11px] ml-1">
                  Member since {joinedDate}
                </span>
              )}
            </div>
          </div>

          {/* ── Dashboard Navigation Tabs ── */}
          <div className="flex border-t border-gray-100 overflow-x-auto scrollbar-none bg-gray-50/60">
            {[
              { id: 'overview',  label: 'Overview',                      icon: LayoutDashboard },
              { id: 'orders',    label: `Orders (${orders.length})`,     icon: ShoppingBag, alert: activeOrdersCount > 0 },
              { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: MessageSquare, alert: pendingInquiriesCount > 0 },
              { id: 'wishlist',  label: `Wishlist (${wishlist.length})`,  icon: Heart },
              { id: 'profile',   label: 'Account Details',               icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3.5 px-3 text-xs font-bold transition-all relative shrink-0 ${
                    active
                      ? 'text-gray-950 bg-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-amber-600' : 'text-gray-400'} />
                  <span>{tab.label}</span>
                  {tab.alert && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Tab Content Area ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >

            {/* ══════════════════════════════════════════════════════════════
                1. OVERVIEW / DASHBOARD HOME TAB
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[
                    {
                      label: 'Total Orders',
                      value: orders.length,
                      subtext: `${activeOrdersCount} active`,
                      icon: ShoppingBag,
                      color: 'text-amber-600',
                      bg: 'bg-amber-50',
                      tab: 'orders',
                    },
                    {
                      label: 'My Inquiries',
                      value: inquiries.length,
                      subtext: `${pendingInquiriesCount} pending`,
                      icon: MessageSquare,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                      tab: 'inquiries',
                    },
                    {
                      label: 'Saved Wishlist',
                      value: wishlist.length,
                      subtext: 'Items bookmarked',
                      icon: Heart,
                      color: 'text-rose-600',
                      bg: 'bg-rose-50',
                      tab: 'wishlist',
                    },
                    {
                      label: 'Account Status',
                      value: 'Active',
                      subtext: user?.isVerified ? 'Verified' : 'Pending',
                      icon: ShieldCheck,
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-50',
                      tab: 'profile',
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        onClick={() => setActiveTab(stat.tab)}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {stat.label}
                          </span>
                          <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon size={14} className={stat.color} />
                          </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{stat.subtext}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Quick actions bar */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 p-4 rounded-2xl border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Need help or want to track an order?</h4>
                      <p className="text-[11px] text-gray-600">Track shipments instantly or send a support message to our team.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      to="/track"
                      className="flex-1 sm:flex-none text-center px-4 py-2 bg-white text-gray-800 rounded-xl text-xs font-bold border border-amber-200 hover:bg-amber-50 transition-colors shadow-sm"
                    >
                      Track Order
                    </Link>
                    <button
                      onClick={() => setShowNewInquiryModal(true)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm flex items-center justify-center gap-1"
                    >
                      <Plus size={13} /> Ask Question
                    </button>
                  </div>
                </div>

                {/* Recent Orders & Inquiries Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Recent Orders */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag size={16} className="text-amber-600" />
                        Recent Orders
                      </h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                      >
                        View all <ChevronRight size={12} />
                      </button>
                    </div>

                    {ordersLoading ? (
                      <div className="py-12 flex justify-center">
                        <Loader2 size={24} className="animate-spin text-amber-600" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-10">
                        <ShoppingBag size={32} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">No orders placed yet</p>
                        <Link to="/shop" className="text-xs font-bold text-amber-700 mt-2 inline-block">
                          Start Shopping →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order) => {
                          const firstItem = order.items?.[0];
                          return (
                            <div
                              key={order._id}
                              onClick={() => setSelectedOrder(order)}
                              className="p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-amber-200 transition-all cursor-pointer flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {firstItem?.image ? (
                                  <img
                                    src={resolveImg(firstItem.image)}
                                    alt="item"
                                    className="w-12 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-14 rounded-xl bg-gray-100 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">
                                    {order.items?.length === 1 ? firstItem?.name : `${firstItem?.name} +${order.items.length - 1}`}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {formatPrice(order.total)}</p>
                                </div>
                              </div>
                              <OrderStatusBadge status={order.status} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recent Inquiries */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare size={16} className="text-amber-600" />
                        Support Inquiries
                      </h3>
                      <button
                        onClick={() => setActiveTab('inquiries')}
                        className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                      >
                        View all <ChevronRight size={12} />
                      </button>
                    </div>

                    {inquiriesLoading ? (
                      <div className="py-12 flex justify-center">
                        <Loader2 size={24} className="animate-spin text-amber-600" />
                      </div>
                    ) : inquiries.length === 0 ? (
                      <div className="text-center py-10">
                        <MessageSquare size={32} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">No support inquiries submitted</p>
                        <button
                          onClick={() => setShowNewInquiryModal(true)}
                          className="text-xs font-bold text-amber-700 mt-2 inline-block"
                        >
                          Send a message →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inquiries.slice(0, 3).map((inq) => (
                          <div
                            key={inq._id}
                            onClick={() => {
                              setActiveTab('inquiries');
                              setExpandedInquiryId(inq._id);
                            }}
                            className="p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-amber-200 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-bold text-gray-900 truncate">{inq.subject || 'General Inquiry'}</p>
                              <ContactStatusBadge status={inq.status} />
                            </div>
                            <p className="text-[11px] text-gray-500 line-clamp-1">{inq.message}</p>
                            {inq.adminReply && (
                              <p className="text-[10px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                                <CheckCircle2 size={10} /> Team replied: "{inq.adminReply.slice(0, 40)}…"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                2. ORDERS TAB
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Order History</h2>
                    <p className="text-xs text-gray-400">Track and manage all your purchases</p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {['all', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setOrderFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors shrink-0 ${
                          orderFilter === f
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 size={28} className="animate-spin text-amber-600" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <ShoppingBag size={40} className="text-gray-200" />
                    <p className="text-sm text-gray-500 font-medium">
                      {orderFilter === 'all' ? 'No orders placed yet' : `No ${orderFilter} orders`}
                    </p>
                    <Link to="/shop" className="text-xs font-bold text-amber-700 hover:underline">
                      Explore our collections →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const firstItem = order.items?.[0];
                      return (
                        <motion.button
                          key={order._id}
                          onClick={() => setSelectedOrder(order)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full text-left p-4 rounded-2xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50/20 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            {firstItem?.image ? (
                              <img
                                src={resolveImg(firstItem.image)}
                                alt={firstItem.name}
                                className="w-16 h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                <ShoppingBag size={22} className="text-gray-300" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-[10px] font-mono text-gray-400 truncate">ID: {order._id}</p>
                                <OrderStatusBadge status={order.status} />
                              </div>
                              <p className="text-xs font-bold text-gray-900 line-clamp-1">
                                {order.items?.length === 1
                                  ? firstItem?.name
                                  : `${firstItem?.name} +${order.items.length - 1} more items`}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                                <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                              </div>
                              {order.trackingNumber && (
                                <p className="text-[10px] text-amber-700 font-mono font-bold mt-1.5 flex items-center gap-1">
                                  <Truck size={11} /> Tracking: {order.trackingNumber}
                                </p>
                              )}
                            </div>

                            <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-600 shrink-0 transition-colors" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                3. CONTACT INQUIRIES & SUPPORT TAB
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'inquiries' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">My Support Inquiries</h2>
                    <p className="text-xs text-gray-400">Track messages and replies from our team</p>
                  </div>
                  <button
                    onClick={() => setShowNewInquiryModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-950 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    <Plus size={14} /> New Inquiry
                  </button>
                </div>

                {inquiriesLoading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 size={28} className="animate-spin text-amber-600" />
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <MessageSquare size={40} className="text-gray-200" />
                    <p className="text-sm text-gray-500 font-medium">You haven't submitted any inquiries yet</p>
                    <button
                      onClick={() => setShowNewInquiryModal(true)}
                      className="text-xs font-bold text-amber-700 hover:underline"
                    >
                      Send your first message →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inq) => {
                      const isExpanded = expandedInquiryId === inq._id;
                      return (
                        <div
                          key={inq._id}
                          className="rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors bg-gray-50/40"
                        >
                          <div
                            onClick={() => setExpandedInquiryId(isExpanded ? null : inq._id)}
                            className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-gray-400">#{inq._id.slice(-6)}</span>
                                <h4 className="text-sm font-bold text-gray-900 truncate">
                                  {inq.subject || 'General Inquiry'}
                                </h4>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">{inq.message}</p>
                              <p className="text-[10px] text-gray-400">{formatDateTime(inq.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <ContactStatusBadge status={inq.status} />
                              <ChevronRight
                                size={15}
                                className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              />
                            </div>
                          </div>

                          {/* Expanded message & team reply */}
                          {isExpanded && (
                            <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-white space-y-4 text-xs">
                              {/* Original inquiry message */}
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Your Message</p>
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                              </div>

                              {/* Official Team reply */}
                              {inq.adminReply ? (
                                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                                      <CheckCircle2 size={13} className="text-blue-600" />
                                      Fade Find Support Team Response
                                    </p>
                                    {inq.repliedAt && (
                                      <span className="text-[10px] text-blue-600 font-medium">
                                        {formatDateTime(inq.repliedAt)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{inq.adminReply}</p>
                                </div>
                              ) : (
                                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/50 text-amber-800 text-[11px] flex items-center gap-2">
                                  <Clock size={13} className="text-amber-600 shrink-0" />
                                  <span>Our team is currently reviewing your inquiry. We'll update you by email as soon as possible.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                4. WISHLIST TAB
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Saved Wishlist</h2>
                    <p className="text-xs text-gray-400">Items you've bookmarked for later</p>
                  </div>
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
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <Heart size={40} className="text-gray-200" />
                    <p className="text-sm text-gray-500 font-medium">Your wishlist is empty</p>
                    <Link to="/shop" className="text-xs font-bold text-amber-700 hover:underline">
                      Browse trending products →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((product) => {
                      const pid = product._id || product.id;
                      const img = resolveImg(product.mainImage || product.image);
                      const firstVariant = product.variants?.[0];
                      const price = firstVariant?.price ?? 0;
                      const disc  = firstVariant?.discount ?? 0;
                      const displayPrice = disc > 0 ? Math.round(price * (1 - disc / 100)) : price;
                      return (
                        <div
                          key={pid}
                          className="flex items-center gap-4 p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/40 transition-colors"
                        >
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
                            <Link to={`/product/${pid}`} className="text-xs font-bold text-gray-900 hover:text-amber-700 line-clamp-1">
                              {product.name}
                            </Link>
                            {product.brand?.name && (
                              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-0.5">{product.brand.name}</p>
                            )}
                            {price > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black text-gray-900">{formatPrice(displayPrice)}</span>
                                {disc > 0 && (
                                  <span className="text-[10px] text-gray-400 line-through">{formatPrice(price)}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => toggleWishlist(product)}
                            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                5. ACCOUNT DETAILS & PROFILE TAB (All User Modal Fields)
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Personal Information & Address</h2>
                      <p className="text-xs text-gray-400">Manage your contact details and default shipping address</p>
                    </div>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline"
                      >
                        <Edit3 size={13} /> Edit Details
                      </button>
                    )}
                  </div>

                  {/* Account Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <User size={13} className="text-amber-600" /> First Name <span className="text-rose-500">*</span>
                      </label>
                      {editing ? (
                        <input
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                          className="w-full text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                          placeholder="Sara"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-gray-900">{form.firstName || user?.firstName || user?.name?.split(' ')[0] || '—'}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <User size={13} className="text-amber-600" /> Last Name <span className="text-rose-500">*</span>
                      </label>
                      {editing ? (
                        <input
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          required
                          className="w-full text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                          placeholder="Ahmed"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-gray-900">{form.lastName || user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '—'}</p>
                      )}
                    </div>

                    {/* Email Address (Read-only) */}
                    <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Mail size={13} className="text-amber-600" /> Email Address
                      </label>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-800 truncate">{user?.email || '—'}</p>
                        {user?.isVerified && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Phone size={13} className="text-amber-600" /> Phone Number
                      </label>
                      {editing ? (
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                          placeholder="+92 300 1234567"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-gray-900">{user?.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                      )}
                    </div>

                    {/* Profile Picture Card */}
                    <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl border border-gray-200 shadow-xs overflow-hidden bg-gray-100 shrink-0">
                          {avatarPreview || user?.avatar ? (
                            <img
                              src={avatarPreview || resolveImg(user?.avatar)}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-bold text-white text-lg">
                              {(user?.name?.[0] || 'U').toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Profile Picture / Avatar</p>
                          <p className="text-[11px] text-gray-400">JPG, PNG, WEBP, or GIF up to 5MB</p>
                        </div>
                      </div>

                      {editing ? (
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-xl text-xs font-bold text-gray-700 transition-colors shadow-xs">
                          <Camera size={14} className="text-amber-600" />
                          <span>{avatarFile ? 'Change Selected Image' : 'Upload New Photo'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditing(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 transition-colors"
                        >
                          <Camera size={13} className="text-gray-400" />
                          <span>Change Photo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address Section */}
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-600" /> Default Shipping Address
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Street Address */}
                      <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 sm:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                          Street Address / House & Building
                        </label>
                        {editing ? (
                          <input
                            name="street"
                            value={form.street}
                            onChange={handleChange}
                            className="w-full text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                            placeholder="e.g. 14-F, Main Boulevard, Gulberg III"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-gray-900">{form.street || <span className="text-gray-400 italic">Not set</span>}</p>
                        )}
                      </div>

                      {/* City */}
                      <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Building2 size={12} className="text-gray-400" /> City
                        </label>
                        {editing ? (
                          <input
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            className="w-full text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                            placeholder="e.g. Lahore"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-gray-900">{form.city || <span className="text-gray-400 italic">Not set</span>}</p>
                        )}
                      </div>

                      {/* State / Province */}
                      <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <MapPinned size={12} className="text-gray-400" /> State / Province
                        </label>
                        {editing ? (
                          <input
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            className="w-full text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                            placeholder="e.g. Punjab"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-gray-900">{form.state || <span className="text-gray-400 italic">Not set</span>}</p>
                        )}
                      </div>

                      {/* Postal / ZIP Code */}
                      <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                          Postal / ZIP Code
                        </label>
                        {editing ? (
                          <input
                            name="zip"
                            value={form.zip}
                            onChange={handleChange}
                            className="w-full text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                            placeholder="e.g. 54000"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-gray-900">{form.zip || <span className="text-gray-400 italic">Not set</span>}</p>
                        )}
                      </div>

                      {/* Country */}
                      <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Globe size={12} className="text-gray-400" /> Country
                        </label>
                        {editing ? (
                          <input
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            className="w-full text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                            placeholder="Pakistan"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-gray-900">{form.country || 'Pakistan'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {editing && (
                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 text-xs font-bold bg-gray-950 text-white rounded-xl hover:bg-amber-700 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <Save size={13} /> {saving ? 'Saving…' : 'Save Details'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sign Out Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Session & Security</h3>
                    <p className="text-xs text-gray-400">Sign out of your account on this browser</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      {/* ── Modals ── */}
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

      {showNewInquiryModal && (
        <NewInquiryModal
          user={user}
          onClose={() => setShowNewInquiryModal(false)}
          onCreated={(newInq) => {
            setInquiries((prev) => [newInq, ...prev]);
            setShowNewInquiryModal(false);
            setActiveTab('inquiries');
          }}
        />
      )}
    </main>
  );
}
