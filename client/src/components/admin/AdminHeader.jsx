import React, { useState } from 'react';
import { Menu, Bell, Search, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminHeader({ onOpenMobileSidebar, activeTitle }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();

  const avatarSrc = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE}${user.avatar}`)
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#c9a96e] tracking-widest uppercase">Admin Dashboard</span>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-semibold text-gray-700">{activeTitle}</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight hidden sm:block">
            {activeTitle} Management
          </h2>
        </div>
      </div>

      {/* Right: Search, Notifications & User profile pill */}
      <div className="flex items-center gap-3">
        {/* Quick global search */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all"
          />
        </div>

        {/* Notifications popup trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c9a96e] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-30 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-900">System Activity</span>
                <span className="text-[10px] text-[#c9a96e] font-semibold">Live Mode</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-amber-50/50 rounded-xl border border-amber-100">
                  <p className="font-semibold text-amber-900 text-[11px]">Schema Verification Passed</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">5 Mongoose models mapped to UI state.</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-800 text-[11px]">System Ready</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Admin dashboard operating in UI mode.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin profile pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <img
            src={avatarSrc}
            alt="Admin Avatar"
            className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#c9a96e]/30"
          />
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-900">{user?.name || 'Admin'}</span>
              <ShieldCheck size={13} className="text-[#c9a96e]" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium block -mt-0.5">
              {user?.role === 'admin' ? 'Super Administrator' : 'Staff'}
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="ml-1 text-[10px] font-semibold text-gray-400 hover:text-rose-500 transition-colors"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
