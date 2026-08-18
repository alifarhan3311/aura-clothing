import React from 'react';
import { Menu, ChevronRight, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const cleanBase = API_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export default function AdminHeader({ onOpenMobileSidebar, activeTitle }) {
  const { user, logout } = useAuth();

  const avatarSrc = user?.avatar
    ? resolveImg(user.avatar)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=c9a96e&color=111&bold=true&size=80`;

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

      {/* Right: User Pill & Logout */}
      <div className="flex items-center gap-2.5 shrink-0">
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
          className="hidden sm:flex items-center gap-1 ml-1 text-[10px] font-semibold text-gray-400 hover:text-rose-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
          title="Logout"
        >
          <LogOut size={11} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
