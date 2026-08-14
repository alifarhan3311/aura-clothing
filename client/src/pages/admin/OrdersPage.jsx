import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Clock, CheckCircle2, Truck, Package,
  XCircle, AlertTriangle, Eye, ChevronDown, Search,
  ExternalLink, Loader2, RefreshCw, MapPin, Phone,
  Mail, Tag, CreditCard, Banknote, Filter, CheckCheck, X,
} from 'lucide-react';
import { showSuccess, showError, showInfo } from '../../lib/toastUtils';
import { orderApi } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatPrice = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });

const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  pending:           { label: 'Pending',          color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   Icon: Clock },
  confirmed:         { label: 'Confirmed',         color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    Icon: CheckCircle2 },
  dispatched:        { label: 'Dispatched',        color: 'text-purple-700',  bg: 'bg-purple-50',   border: 'border-purple-200',  Icon: Truck },
  delivered:         { label: 'Delivered',         color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', Icon: Package },
  cancelled:         { label: 'Cancelled',         color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     Icon: XCircle },
  rejected:          { label: 'Rejected',          color: 'text-rose-800',    bg: 'bg-rose-50',     border: 'border-rose-200',    Icon: AlertTriangle },
  cancel_requested:  { label: 'Cancel Requested',  color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  Icon: AlertTriangle },
};

const STATUS_FLOW = ['pending', 'confirmed', 'dispatched', 'delivered'];

function StatusBadge({ status, size = 'sm' }) {
  const s = STATUS[status] || STATUS.pending;
  const { Icon } = s;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border capitalize ${s.bg} ${s.color} ${s.border} ${size === 'xs' ? 'text-[10px]' : 'text-[11px]'}`}>
      <Icon size={size === 'xs' ? 10 : 12} />
      {s.label}
    </span>
  );
}

// ── Order Detail Drawer ───────────────────────────────────────────────────────
function OrderDetailDrawer({ order, onClose, onStatusChange }) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [processingCancel, setProcessingCancel] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setNote('');
      setRejectNote('');
    }
  }, [order]);

  if (!order) return null;

  const hasCancelRequest = order.status === 'cancel_requested';

  const handleApproveCancelRequest = async () => {
    if (!window.confirm('Approve this cancellation? The order will be marked as Cancelled.')) return;
    setProcessingCancel(true);
    try {
      const res = await orderApi.approveCancelRequest(order._id, 'Cancellation approved by admin.');
      onStatusChange(res.order || { ...order, status: 'cancelled' });
      showSuccess('Cancellation approved. Order cancelled.');
    } catch (err) {
      showError(err.message || 'Failed to approve cancellation');
    } finally {
      setProcessingCancel(false);
    }
  };

  const handleRejectCancelRequest = async () => {
    if (!rejectNote.trim()) {
      showError('Please provide a reason for rejecting the cancellation request.');
      return;
    }
    setProcessingCancel(true);
    try {
      const res = await orderApi.rejectCancelRequest(order._id, rejectNote.trim());
      onStatusChange(res.order || { ...order, status: res.order?.status || 'confirmed' });
      showSuccess('Cancellation request rejected. Order restored.');
      setRejectNote('');
    } catch (err) {
      showError(err.message || 'Failed to reject cancellation');
    } finally {
      setProcessingCancel(false);
    }
  };

  const handleUpdate = async () => {
    if (selectedStatus === order.status && !note.trim()) return;
    setUpdating(true);
    try {
      const res = await orderApi.updateStatus(order._id, selectedStatus, note.trim());
      onStatusChange(res.order || { ...order, status: selectedStatus });
      showSuccess(`Order status updated → "${STATUS[selectedStatus]?.label}"`);
      setNote('');
    } catch (err) {
      showError(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const canProgress = STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1;
  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 z-50 flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="w-full max-w-lg bg-white h-full overflow-y-auto flex flex-col shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Drawer Header */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Order Details</h2>
              <p className="text-xs text-gray-400 font-mono">{order._id}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-5">

            {/* ── Cancel Request Panel ── */}
            {hasCancelRequest && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-orange-100 border-b border-orange-200 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-orange-700" />
                  <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                    Cancellation Requested by Customer
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {/* Cancel reason */}
                  {order.cancelReason && (
                    <div className="p-3 bg-white rounded-xl border border-orange-200">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Customer's Reason</p>
                      <p className="text-sm text-gray-800 italic">"{order.cancelReason}"</p>
                    </div>
                  )}
                  {order.cancelRequestedAt && (
                    <p className="text-[11px] text-orange-600">
                      Requested at: {formatDateTime(order.cancelRequestedAt)}
                    </p>
                  )}

                  {/* Reject note input */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                      Rejection Reason <span className="text-gray-400 font-normal">(required to reject)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="e.g. Order already dispatched, cannot cancel…"
                      className="w-full px-3 py-2.5 text-xs bg-white border border-orange-200 rounded-xl outline-none focus:border-orange-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleRejectCancelRequest}
                      disabled={processingCancel || !rejectNote.trim()}
                      className="flex items-center justify-center gap-1.5 py-2.5 border-2 border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingCancel
                        ? <Loader2 size={13} className="animate-spin" />
                        : <X size={13} />}
                      Reject Request
                    </button>
                    <button
                      onClick={handleApproveCancelRequest}
                      disabled={processingCancel}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingCancel
                        ? <Loader2 size={13} className="animate-spin" />
                        : <CheckCheck size={13} />}
                      Approve & Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* quick actions */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Update Status</p>

              {/* Quick progress button */}
              {canProgress && !['cancelled', 'rejected', 'cancel_requested'].includes(order.status) && (
                <button
                  onClick={() => setSelectedStatus(nextStatus)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    selectedStatus === nextStatus
                      ? `${STATUS[nextStatus].bg} ${STATUS[nextStatus].border} ${STATUS[nextStatus].color}`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>Mark as {STATUS[nextStatus]?.label}</span>
                  <ChevronDown size={15} className="rotate-[-90deg]" />
                </button>
              )}

              {/* Full status selector — exclude cancel_requested (set by user only) */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(STATUS).filter(([key]) => key !== 'cancel_requested').map(([key, val]) => {
                  const { Icon } = val;
                  const isActive = selectedStatus === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedStatus(key)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-[10px] font-bold uppercase tracking-wide transition-all ${
                        isActive
                          ? `${val.bg} ${val.border} ${val.color} shadow-sm`
                          : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                      }`}
                    >
                      <Icon size={14} />
                      {val.label}
                    </button>
                  );
                })}
              </div>

              {/* Note */}
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note to customer (e.g. 'Dispatched via TCS Courier')"
                className="w-full px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-[#c9a96e] transition-colors resize-none"
              />

              <button
                onClick={handleUpdate}
                disabled={updating || (selectedStatus === order.status && !note.trim())}
                className="w-full py-2.5 bg-gray-900 hover:bg-[#c9a96e] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 size={13} className="animate-spin" /> : null}
                {updating ? 'Updating…' : 'Apply Status Update'}
              </button>
            </div>

            {/* Tracking number */}
            {order.trackingNumber && (
              <div className="bg-gray-900 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Tracking Number</p>
                <p className="text-base font-black text-amber-400 font-mono tracking-widest">{order.trackingNumber}</p>
                <p className="text-[10px] text-gray-500 mt-1">Auto-generated on confirmation</p>
              </div>
            )}

            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Customer & Shipping</p>
              </div>
              <div className="p-4 space-y-2.5 text-sm">
                <div className="font-bold text-gray-900">
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Mail size={13} className="text-amber-600 shrink-0" />
                  {order.shippingInfo.email}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Phone size={13} className="text-amber-600 shrink-0" />
                  {order.shippingInfo.phone}
                </div>
                <div className="flex items-start gap-2 text-gray-500 text-xs">
                  <MapPin size={13} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.postalCode}, {order.shippingInfo.country}
                  </span>
                </div>
              </div>
            </div>

            {/* Order meta */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Payment</p>
                <div className="flex items-center gap-1.5">
                  {order.paymentMethod === 'cod'
                    ? <Banknote size={14} className="text-amber-600" />
                    : <CreditCard size={14} className="text-blue-600" />}
                  <span className="text-xs font-semibold text-gray-800">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Shipping</p>
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-purple-600" />
                  <span className="text-xs font-semibold text-gray-800 capitalize">{order.shippingMethod}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Order Items ({order.items.length})</p>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-3">
                    {item.image ? (
                      <img src={resolveImg(item.image)} alt={item.name} className="w-12 h-14 rounded-lg object-cover border border-gray-100 shrink-0" />
                    ) : (
                      <div className="w-12 h-14 rounded-lg bg-gray-100 shrink-0" />
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
            </div>

            {/* Price breakdown */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> Coupon ({order.couponCode})
                  </span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-base">
                <span>Total</span>
                <span className="text-amber-700">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Status history */}
            {order.statusHistory?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status History</p>
                </div>
                <div className="p-4 space-y-3">
                  {[...order.statusHistory].reverse().map((h, idx) => {
                    const s = STATUS[h.status] || STATUS.pending;
                    const { Icon } = s;
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.bg} ${s.color} border ${s.border}`}>
                          <Icon size={13} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${s.color}`}>{s.label}</p>
                          {h.note && <p className="text-[11px] text-gray-500 italic mt-0.5">"{h.note}"</p>}
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(h.changedAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Orders Page ──────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (pg = 1, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const params = { page: pg, limit: pageSize };
      if (statusFilter) params.status = statusFilter;
      const res = await orderApi.getAll(params);
      setOrders(res.orders || []);
      setTotal(res.total || 0);
      setPage(pg);
    } catch (err) {
      showError('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, pageSize]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  // Client-side search filter
  const filtered = search.trim()
    ? orders.filter((o) => {
        const q = search.toLowerCase();
        return (
          o._id?.toLowerCase().includes(q) ||
          o.trackingNumber?.toLowerCase().includes(q) ||
          `${o.shippingInfo?.firstName} ${o.shippingInfo?.lastName}`.toLowerCase().includes(q) ||
          o.shippingInfo?.email?.toLowerCase().includes(q) ||
          o.shippingInfo?.phone?.includes(q)
        );
      })
    : orders;

  const totalPages = Math.ceil(total / pageSize);

  const handleStatusChange = (updatedOrder) => {
    setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
    if (selectedOrder?._id === updatedOrder._id) {
      setSelectedOrder(updatedOrder);
    }
  };

  // Stats summary
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* Status stat pills */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS).map(([key, val]) => {
          const { Icon } = val;
          const count = statusCounts[key] || 0;
          const isActive = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => { setStatusFilter(isActive ? '' : key); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? `${val.bg} ${val.border} ${val.color} shadow-sm`
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Icon size={13} />
              {val.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/60' : 'bg-gray-100'}`}>
                {count}
              </span>
            </button>
          );
        })}
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 bg-white transition-all"
          >
            <XCircle size={13} /> Clear filter
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Orders</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {total} total orders · {statusFilter ? `filtered by ${STATUS[statusFilter]?.label}` : 'all statuses'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, name, email, tracking…"
                className="pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] w-64 transition-all"
              />
            </div>
            <button
              onClick={() => fetchOrders(page, true)}
              disabled={refreshing}
              className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
              title="Refresh"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-amber-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <ShoppingCart size={36} className="text-gray-200" />
              <p className="font-semibold text-sm text-gray-500">No orders found</p>
              <p className="text-xs">Try adjusting the filter or search term</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-amber-50/20 transition-colors">
                    {/* Order ID + tracking */}
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-[11px] text-gray-500 truncate max-w-[120px]">{order._id}</p>
                      {order.trackingNumber && (
                        <p className="text-[10px] text-amber-700 font-mono font-bold mt-0.5">{order.trackingNumber}</p>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">
                        {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{order.shippingInfo?.email}</p>
                      <p className="text-[11px] text-gray-400">{order.shippingInfo?.city}</p>
                    </td>

                    {/* Items preview */}
                    <td className="py-3.5 px-4">
                      <div className="flex -space-x-2">
                        {order.items?.slice(0, 3).map((item, i) => (
                          item.image ? (
                            <img
                              key={i}
                              src={resolveImg(item.image)}
                              alt={item.name}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                              title={item.name}
                            />
                          ) : (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white" />
                          )
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{order.items?.length} item(s)</p>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                      {order.discount > 0 && (
                        <p className="text-[10px] text-emerald-600 font-medium">−{formatPrice(order.discount)} off</p>
                      )}
                      <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                        {order.paymentMethod === 'cod' ? 'COD' : 'Card'} · {order.shippingMethod}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} size="xs" />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4">
                      <span className="text-gray-400 text-[11px]">{formatDate(order.createdAt)}</span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-[#c9a96e] text-white text-[11px] font-semibold rounded-lg transition-colors"
                      >
                        <Eye size={12} /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing <strong className="text-gray-800">{(page - 1) * pageSize + 1}</strong>–
              <strong className="text-gray-800">{Math.min(page * pageSize, total)}</strong> of{' '}
              <strong className="text-gray-800">{total}</strong> orders
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchOrders(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Prev
              </button>
              <span className="font-semibold text-gray-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => fetchOrders(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
