/**
 * toastUtils.js — Centralized toast notification helpers.
 * Import from here instead of duplicating inline style objects in every page.
 * All toasts appear in the bottom-right corner (configured globally in App.jsx).
 */
import toast from 'react-hot-toast';

const BASE_STYLE = {
  background: '#111111',
  color: '#f5f5f5',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: '500',
  padding: '12px 16px',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
};

const GOLD_ICON = { primary: '#c9a96e', secondary: '#111111' };
const RED_ICON  = { primary: '#f87171', secondary: '#111111' };
const INFO_ICON = { primary: '#94a3b8', secondary: '#111111' };

/** Success — green checkmark with gold icon. Use for creates & updates. */
export function showSuccess(message, opts = {}) {
  return toast.success(message, {
    style: BASE_STYLE,
    iconTheme: GOLD_ICON,
    duration: 3500,
    ...opts,
  });
}

/** Error — red X. Use for API failures. */
export function showError(message, opts = {}) {
  return toast.error(message || 'Something went wrong. Please try again.', {
    style: { ...BASE_STYLE, border: '1px solid rgba(248,113,113,0.25)' },
    iconTheme: RED_ICON,
    duration: 4500,
    ...opts,
  });
}

/** Delete — neutral grey. Use for successful deletes (NOT toast.error). */
export function showDelete(message = 'Record deleted.', opts = {}) {
  return toast(message, {
    icon: '🗑️',
    style: { ...BASE_STYLE, border: '1px solid rgba(148,163,184,0.2)' },
    duration: 3000,
    ...opts,
  });
}

/** Info — neutral, no icon override. Use for general informational messages. */
export function showInfo(message, opts = {}) {
  return toast(message, {
    icon: 'ℹ️',
    style: BASE_STYLE,
    iconTheme: INFO_ICON,
    duration: 3000,
    ...opts,
  });
}

/** Loading — returns toast id for dismissal. */
export function showLoading(message = 'Processing…') {
  return toast.loading(message, {
    style: BASE_STYLE,
  });
}

/** Dismiss a specific toast by id. */
export function dismissToast(id) {
  toast.dismiss(id);
}
