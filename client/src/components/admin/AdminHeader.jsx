import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronRight, LogOut, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminHeader({ onOpenMobileSidebar, activeTitle }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const notifRef = useRef(null);

  const avatarSrc = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE}${user.avatar}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=c9a96e&color=111&bold=true&size=80`;

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-semibold truncate">
          <span className="text-[#c9a96e] font-bold tracking-wide uppercase text-[10px]">
            Admin
          </span>
          <ChevronRight size={12} className="text-gray-300 shrink-0" />
          <span className="text-gray-700 font-semibold truncate">{activeTitle}</span>
        </div>
      </div>

      {/* Right: Notifications & User */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                  <span className="text-xs font-bold text-gray-900">System Activity</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ● Live
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-all"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px]">✓</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-800">Schema Verification Passed</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">5 Mongoose models mapped to UI state.</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px]">◎</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-800">Admin Dashboard Ready</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">All modules operating normally.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User Pill */}
        <div className="flex items-center gap-2.5">
          <img
            src={avatarSrc}
            alt="Admin"
            className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#c9a96e]/30 shrink-0"
          />
          <div className="hidden sm:block leading-none">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-900">{user?.name || 'Admin'}</span>
              <ShieldCheck size={12} className="text-[#c9a96e]" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
              {user?.role === 'admin' ? 'Administrator' : 'Staff'}
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="hidden sm:flex items-center gap-1 ml-1 text-[10px] font-semibold text-gray-400 hover:text-rose-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-rose-50"
            title="Logout"
          >
            <LogOut size={11} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
