import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Heart, Search, User, Menu, X, ChevronDown,
  LogOut, LayoutDashboard, MapPin, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    setSearchOpen(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

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

            {/* ── Right icons ── */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={18} className="text-gray-700" />
              </button>

              {/* User */}
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
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
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
                  className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <User size={18} className="text-gray-700" />
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag size={18} className="text-gray-700" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gray-900 text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-gray-100"
              >
                <form onSubmit={handleSearch} className="py-3 flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, categories…"
                    className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
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

              <nav className="flex-1 p-4 space-y-1">
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
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
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
    </>
  );
}
