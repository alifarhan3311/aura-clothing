import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Heart, Search, User, Menu, X, ChevronDown,
  LogOut, LayoutDashboard, MapPin, Sparkles, Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SearchModal from '../ui/SearchModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

// ── User Avatar ───────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 8 }) {
  const dim = `w-${size} h-${size}`;
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (user?.avatar) {
    return (
      <img
        src={resolveImg(user.avatar)}
        alt={user.name}
        className={`${dim} rounded-full object-cover border-2 border-white shadow-sm`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white font-black text-[11px] border-2 border-white shadow-sm`}>
      {initials}
    </div>
  );
}

const NAV_LINKS = [
  { label: 'Home',    to: '/', end: true },
  { label: 'Shop',    to: '/shop' },
  { label: 'About',   to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Track Order', to: '/track', icon: MapPin },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { cartCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Global shortcut to open Search Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/98 backdrop-blur-md shadow-md border-b border-gray-100'
            : 'bg-white/92 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-[68px]">

            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center -ml-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} className="text-gray-800" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0"
            >
              <span
                className="text-2xl font-black tracking-[0.2em] text-gray-900 select-none"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Fade Find
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors rounded-xl ${
                        isActive
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    {Icon && <Icon size={14} className="text-amber-600" />}
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Desktop Search Trigger Button with Shortcut Hint */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-gray-100/90 hover:bg-gray-200/80 border border-gray-200/60 rounded-full text-xs text-gray-500 transition-all shadow-2xs group cursor-pointer"
                title="Search products (Cmd+K or Ctrl+K)"
              >
                <Search size={14} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                <span className="font-medium text-gray-500 group-hover:text-gray-700">Search products…</span>
                <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded-md shadow-2xs ml-1">
                  <span>⌘</span>K
                </kbd>
              </button>

              {/* Mobile Search Icon Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700"
                aria-label="Search products"
              >
                <Search size={19} />
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((s) => !s)}
                    className="flex items-center gap-1.5 px-1.5 py-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <UserAvatar user={user} size={8} />
                    <ChevronDown
                      size={12}
                      className={`text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} size={9} />
                            <div className="min-w-0">
                              <p className="text-xs font-black text-gray-900 truncate">{user?.name}</p>
                              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          <User size={14} className="text-gray-400" /> My Profile
                        </Link>
                        <Link to="/track" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          <MapPin size={14} className="text-gray-400" /> Track Order
                        </Link>

                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-50 transition-colors">
                            <LayoutDashboard size={14} className="text-amber-500" />
                            <span className="flex items-center gap-1.5">
                              Admin Panel <Sparkles size={10} className="text-amber-400" />
                            </span>
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-amber-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <User size={15} /> Sign In
                </Link>
              )}

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingBag size={18} className="text-gray-800" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-scale-in">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 md:hidden flex flex-col shadow-2xl overflow-y-auto"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <span className="text-lg font-black tracking-[0.2em]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Fade Find
                </span>
                <button onClick={() => setMobileOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                {/* Mobile Search Button */}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs font-semibold text-gray-700 hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-gray-500">
                    <Search size={16} className="text-amber-600" />
                    <span>Search all products…</span>
                  </div>
                  <kbd className="px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded-md">
                    ⌘K
                  </kbd>
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-100 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
                      <UserAvatar user={user} size={10} />
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      <User size={18} /> My Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-amber-700 hover:bg-amber-50">
                        <LayoutDashboard size={18} className="text-amber-500" /> Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-amber-600 transition-colors justify-center">
                    <User size={18} /> Login / Register
                  </Link>
                )}
                <Link to="/cart" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <ShoppingBag size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 md:h-[68px]" />

      {/* ── Global Product Search Modal (Redis Cache-Aside) ── */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
