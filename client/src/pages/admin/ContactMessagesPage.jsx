import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MessageSquare, Clock, CheckCircle2, AlertCircle,
  XCircle, Search, RefreshCw, Trash2, Send, ChevronRight,
  Eye, Check, X, Phone, User, Calendar, ExternalLink,
  ShieldCheck, Loader2, ArrowUpDown, Filter, Ban, ThumbsUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contactApi } from '../../lib/api';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-800 border-amber-300', Icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    badge: 'bg-blue-100 text-blue-800 border-blue-300',   Icon: RefreshCw },
  completed:   { label: 'Completed',   color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', Icon: CheckCircle2 },
  resolved:    { label: 'Completed',   color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', Icon: CheckCircle2 },
  rejected:    { label: 'Rejected',    color: 'text-rose-700',    bg: 'bg-rose-50',     border: 'border-rose-200',    badge: 'bg-rose-100 text-rose-800 border-rose-300',   Icon: Ban },
  closed:      { label: 'Closed',      color: 'text-gray-700',    bg: 'bg-gray-100',    border: 'border-gray-200',    badge: 'bg-gray-100 text-gray-700 border-gray-300',   Icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.badge}`}>
      <Icon size={11} className={status === 'in_progress' ? 'animate-spin-slow' : ''} />
      {cfg.label}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Inquiry Detail & Reply Modal ─────────────────────────────────────────────
function InquiryDetailModal({ inquiry, onClose, onUpdated, onDeleted }) {
  const [status, setStatus] = useState(inquiry.status || 'pending');
  const [adminReply, setAdminReply] = useState(inquiry.adminReply || '');
  const [note, setNote] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await contactApi.updateStatus(inquiry._id, {
        status,
        adminReply,
        note: note.trim() || undefined,
        sendNotification,
      });

      toast.success(
        sendNotification
          ? `Status updated to "${STATUS_CONFIG[status]?.label || status}" & email sent!`
          : 'Status updated successfully!',
        {
          style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
        }
      );
      onUpdated(res.contact);
    } catch (err) {
      toast.error(err.message || 'Failed to update inquiry');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = (newStatus) => {
    setStatus(newStatus);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete inquiry from ${inquiry.name}?`)) return;
    setDeleting(true);
    try {
      await contactApi.delete(inquiry._id);
      toast.success('Inquiry deleted');
      onDeleted(inquiry._id);
    } catch (err) {
      toast.error(err.message || 'Failed to delete inquiry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-900 text-sm">
                {inquiry.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{inquiry.subject || 'General Inquiry'}</h3>
                <p className="text-xs text-gray-400 font-mono">Ticket: #{inquiry._id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={inquiry.status} />
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Customer Info Card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Customer Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">{inquiry.name}</p>
                    {inquiry.user && <span className="text-[10px] text-emerald-600 font-bold">Registered User</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <a href={`mailto:${inquiry.email}`} className="text-blue-600 font-semibold hover:underline truncate">
                    {inquiry.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-700">{inquiry.phone || 'No phone provided'}</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                <span>Submitted on {formatDateTime(inquiry.createdAt)}</span>
                {inquiry.repliedAt && (
                  <span className="text-emerald-700 font-medium">
                    Replied on {formatDateTime(inquiry.repliedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Original Customer Message */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                Customer Message
              </label>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </div>
            </div>

            {/* Quick Status Selection Buttons */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
                Set Resolution Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'pending', label: 'Pending', icon: Clock, color: 'hover:border-amber-400 hover:bg-amber-50 active:bg-amber-100', activeBg: 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-400/40' },
                  { id: 'in_progress', label: 'In Progress', icon: RefreshCw, color: 'hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100', activeBg: 'bg-blue-100 text-blue-900 border-blue-400 ring-2 ring-blue-400/40' },
                  { id: 'completed', label: 'Complete', icon: CheckCircle2, color: 'hover:border-emerald-400 hover:bg-emerald-50 active:bg-emerald-100', activeBg: 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-400/40' },
                  { id: 'rejected', label: 'Reject', icon: Ban, color: 'hover:border-rose-400 hover:bg-rose-50 active:bg-rose-100', activeBg: 'bg-rose-100 text-rose-900 border-rose-400 ring-2 ring-rose-400/40' },
                  { id: 'closed', label: 'Close', icon: XCircle, color: 'hover:border-gray-400 hover:bg-gray-100 active:bg-gray-200', activeBg: 'bg-gray-200 text-gray-900 border-gray-400 ring-2 ring-gray-400/40' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = status === item.id || (item.id === 'completed' && status === 'resolved');
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleQuickStatus(item.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all gap-1 ${
                        isSelected
                          ? item.activeBg
                          : `border-gray-200 bg-white text-gray-700 ${item.color}`
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Update Status & Reply Form */}
            <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Internal Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="E.g. Customer contacted via phone, refund approved"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Official Team Reply (Sent to customer via email)
                </label>
                <textarea
                  rows={3}
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Type your reply to the customer here. This will be sent directly to their email address."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Notification toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span className="text-xs font-semibold text-amber-900">
                  Send email update to customer (<span className="font-mono text-amber-800">{inquiry.email}</span>)
                </span>
              </label>

              {/* Status History Timeline */}
              {inquiry.statusHistory?.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                    History & Audit Log
                  </p>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {inquiry.statusHistory.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs text-gray-600 gap-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} />
                          <span>{item.note || 'Status updated'}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatDateTime(item.changedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 text-xs font-bold bg-gray-950 text-white hover:bg-amber-600 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Save & Update Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Admin Inquiries Page ────────────────────────────────────────────────
export default function ContactMessagesPage() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (selectedStatus && selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const [listRes, statsRes] = await Promise.allSettled([
        contactApi.getAll(params),
        contactApi.getStats(),
      ]);

      if (listRes.status === 'fulfilled') {
        const data = listRes.value.contacts || listRes.value.data || [];
        setContacts(Array.isArray(data) ? data : []);
      } else {
        console.error('Fetch contacts failed:', listRes.reason);
        toast.error('Failed to load contact inquiries');
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.stats || { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0, closed: 0 });
      }
    } catch (err) {
      toast.error('Failed to load contact inquiries');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchContacts]);

  // Quick 1-click status update from table row
  const handleQuickRowStatus = async (e, inquiry, newStatus) => {
    e.stopPropagation();
    setActionLoadingId(`${inquiry._id}-${newStatus}`);
    try {
      const res = await contactApi.updateStatus(inquiry._id, {
        status: newStatus,
        sendNotification: true,
        note: `Quick action: marked as ${newStatus}`,
      });

      const updated = res.contact;
      setContacts((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));

      const label = STATUS_CONFIG[newStatus]?.label || newStatus;
      toast.success(`Inquiry marked as ${label} & email sent to ${inquiry.email}!`, {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
      });

      contactApi.getStats().then((sRes) => {
        if (sRes.stats) setStats(sRes.stats);
      });
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleInquiryUpdated = (updated) => {
    setContacts((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    setSelectedInquiry(updated);
    contactApi.getStats().then((res) => {
      if (res.stats) setStats(res.stats);
    });
  };

  const handleInquiryDeleted = (deletedId) => {
    setContacts((prev) => prev.filter((c) => c._id !== deletedId));
    setSelectedInquiry(null);
    contactApi.getStats().then((res) => {
      if (res.stats) setStats(res.stats);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={22} className="text-amber-600" />
            Contact & Support Inquiries
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review customer messages, update resolution status (Complete, Reject, In Progress), and send email replies.
          </p>
        </div>
        <button
          onClick={fetchContacts}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Inquiries', count: stats.total, color: 'text-gray-900', bg: 'bg-gray-100', icon: MessageSquare, id: 'all' },
          { label: 'Pending Review', count: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock, alert: stats.pending > 0, id: 'pending' },
          { label: 'In Progress', count: stats.in_progress, color: 'text-blue-700', bg: 'bg-blue-50', icon: RefreshCw, id: 'in_progress' },
          { label: 'Completed', count: stats.resolved, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2, id: 'resolved' },
          { label: 'Rejected', count: stats.rejected || 0, color: 'text-rose-700', bg: 'bg-rose-50', icon: Ban, id: 'rejected' },
        ].map((item) => {
          const Icon = item.icon;
          const isCurrentFilter = selectedStatus === item.id;
          return (
            <div
              key={item.label}
              onClick={() => setSelectedStatus(item.id)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer bg-white shadow-sm flex items-center justify-between ${
                isCurrentFilter
                  ? 'border-gray-900 ring-2 ring-gray-950/20 shadow-md'
                  : item.alert
                  ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                  : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.label}</p>
                <p className={`text-xl sm:text-2xl font-black mt-1 ${item.color}`}>{item.count}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                <Icon size={17} className={item.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'in_progress', label: 'In Progress', count: stats.in_progress },
            { id: 'resolved', label: 'Completed', count: stats.resolved },
            { id: 'rejected', label: 'Rejected', count: stats.rejected || 0 },
            { id: 'closed', label: 'Closed', count: stats.closed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedStatus === tab.id
                  ? 'bg-gray-950 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative md:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, email, subject…"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Inquiries Table / List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin text-amber-600" />
            <p className="text-xs font-semibold">Loading messages…</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
            <MessageSquare size={32} className="text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">No inquiries found</p>
            <p className="text-xs text-gray-400">
              {search ? 'Try clearing your search query' : 'Customer inquiries will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-4">Subject & Message</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Quick Status Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {contacts.map((inquiry) => (
                  <tr
                    key={inquiry._id}
                    onClick={() => setSelectedInquiry(inquiry)}
                    className="hover:bg-amber-50/30 cursor-pointer transition-colors group"
                  >
                    {/* Customer Info */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-800 text-xs shrink-0">
                          {inquiry.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{inquiry.name}</p>
                          <p className="text-gray-400 text-[11px] truncate">{inquiry.email}</p>
                          {inquiry.phone && <p className="text-gray-400 text-[10px] truncate">📞 {inquiry.phone}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Subject & Preview */}
                    <td className="py-4 px-4 max-w-xs sm:max-w-md">
                      <p className="font-bold text-gray-900 truncate mb-0.5">
                        {inquiry.subject || 'General Inquiry'}
                      </p>
                      <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed">
                        {inquiry.message}
                      </p>
                      {inquiry.adminReply && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit font-medium">
                          <CheckCircle2 size={10} /> Replied by team
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={inquiry.status} />
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500 text-[11px]">
                      {formatDate(inquiry.createdAt)}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Complete Button */}
                        <button
                          title="Mark Complete & Notify"
                          disabled={actionLoadingId === `${inquiry._id}-completed` || inquiry.status === 'completed' || inquiry.status === 'resolved'}
                          onClick={(e) => handleQuickRowStatus(e, inquiry, 'completed')}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 border ${
                            inquiry.status === 'completed' || inquiry.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 opacity-60 cursor-default'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                          }`}
                        >
                          {actionLoadingId === `${inquiry._id}-completed` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          <span>Complete</span>
                        </button>

                        {/* Reject Button */}
                        <button
                          title="Reject Inquiry & Notify"
                          disabled={actionLoadingId === `${inquiry._id}-rejected` || inquiry.status === 'rejected'}
                          onClick={(e) => handleQuickRowStatus(e, inquiry, 'rejected')}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 border ${
                            inquiry.status === 'rejected'
                              ? 'bg-rose-50 text-rose-800 border-rose-300 opacity-60 cursor-default'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                          }`}
                        >
                          {actionLoadingId === `${inquiry._id}-rejected` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Ban size={12} />
                          )}
                          <span>Reject</span>
                        </button>

                        {/* In Progress Button */}
                        <button
                          title="Mark In Progress"
                          disabled={actionLoadingId === `${inquiry._id}-in_progress` || inquiry.status === 'in_progress'}
                          onClick={(e) => handleQuickRowStatus(e, inquiry, 'in_progress')}
                          className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 border ${
                            inquiry.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-800 border-blue-300 opacity-60 cursor-default'
                              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                          }`}
                        >
                          <RefreshCw size={12} className={actionLoadingId === `${inquiry._id}-in_progress` ? 'animate-spin' : ''} />
                        </button>

                        {/* View / Detail Modal */}
                        <button
                          title="View Message & Full Reply"
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="px-2.5 py-1.5 bg-gray-950 text-white hover:bg-amber-600 rounded-xl text-[11px] font-semibold transition-colors shadow-sm flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail & Reply Modal */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onUpdated={handleInquiryUpdated}
          onDeleted={handleInquiryDeleted}
        />
      )}
    </div>
  );
}
