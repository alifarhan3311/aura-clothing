import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User, Menu, X, ChevronDown, Loader2, LogOut, LayoutDashboard, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { categoryApi } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

// ── User Avatar (initials fallback) ──────────────────────────────────────────
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
    <div className={`${dim} rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white font-bold text-[11px] border-2 border-white shadow-sm`}>
      {initials}
    </div>
  );
}

// Static links (no dropdown)
const STATIC_LINKS = [
  { label: 'About',   to: '/about' },
  { label: 'Contact', to: '/contact' },
];

// Sections to show as top-level nav items (maps to category.section)
const NAV_SECTIONS = ['women', 'men', 'kids'];

// ── Dropdown for a section ────────────────────────────────────────────────────
function SectionDropdown({ section, categories, isOpen }) {
  const navigate = useNavigate();
  const filtered = categories.filter(
    (c) => c.section?.toLowerCase() === section.toLowerCase()
  );

  if (!isOpen || filtered.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 min-w-[220px]"
      >
        {/* Section page link */}
        <Link
          to={`/${section}`}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 uppercase tracking-widest transition-colors mb-1"
        >
          View All {section}
        </Link>
        <div className="border-t border-gray-100 my-1" />
        {filtered.map((cat) => (
          <button
            key={cat._id}
            onClick={() => navigate(`/category/${cat._id}`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f0e4cc]/50 transition-colors text-left group"
          >
            {cat.image && (
              <img
                src={resolveImg(cat.image)}
                alt={cat.name}
                className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0"
              />
            )}
            <span className="text-sm font-semibold text-gray-800 group-hover:text-amber-800 transition-colors">
              {cat.name}
            </span>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [openSection, setOpenSection]   = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories]     = useState([]);
  const [catsLoading, setCatsLoading]   = useState(true);

  const { cartCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate      = useNavigate();
  const location      = useLocation();
  const closeTimer    = useRef(null);
  const userMenuRef   = useRef(null);

  // ── Fetch all active categories once ─────────────────────────────────────────
  useEffect(() => {
    categoryApi
      .getAll({ limit: 100 })
      .then((res) => {
        const data = res.categories || res.data || res;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setCatsLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setOpenSection(null);
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

  // Hover open/close with slight delay
  const handleMouseEnter = (section) => {
    clearTimeout(closeTimer.current);
    setOpenSection(section);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenSection(null), 150);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/women?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  // Mobile: categories grouped by section
  const groupedCategories = NAV_SECTIONS.reduce((acc, sec) => {
    acc[sec] = categories.filter((c) => c.section?.toLowerCase() === sec);
    return acc;
  }, {});

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/98 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-white/90 backdrop-blur-sm'
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
                MH
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Home */}
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-lg ${
                    isActive ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                Home
              </NavLink>

              {/* Section dropdowns */}
              {NAV_SECTIONS.map((section) => {
                const sectionCategories = categories.filter(
                  (c) => c.section?.toLowerCase() === section
                );
                const hasCategories = sectionCategories.length > 0;

                return (
                  <div
                    key={section}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(section)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-lg capitalize ${
                        openSection === section
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {section}
                      {hasCategories && (
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 ${openSection === section ? 'rotate-180' : ''}`}
                        />
                      )}
                      {catsLoading && <Loader2 size={11} className="animate-spin opacity-50" />}
                    </button>

                    {hasCategories && (
                      <SectionDropdown
                        section={section}
                        categories={categories}
                        isOpen={openSection === section}
                      />
                    )}
                  </div>
                );
              })}

              {/* Static links */}
              {STATIC_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-lg ${
                      isActive ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Track Order */}
              <NavLink
                to="/track"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-lg ${
                    isActive ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <MapPin size={14} />
                Track
              </NavLink>
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={18} className="text-gray-700" />
              </button>

              {/* User icon / avatar */}
              {isAuthenticated ? (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((s) => !s)}
                    className="flex items-center gap-1.5 px-1.5 py-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Account menu"
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-2.5 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={14} className="text-gray-400" />
                          My Profile
                        </Link>

                        <Link
                          to="/track"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <MapPin size={14} className="text-gray-400" />
                          Track Order
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <LayoutDashboard size={14} className="text-amber-500" />
                            Admin Panel
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <LogOut size={14} />
                            Sign Out
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
                  aria-label="Login"
                >
                  <User size={18} className="text-gray-700" />
                </Link>
              )}

              <Link
                to="/cart"
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag size={18} className="text-gray-700" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5"
                  >
                    {cartCount}
                  </motion.span>
                )}
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
                    className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-[#c9a96e] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-[#c9a96e] transition-colors"
                  >
                    Search
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
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
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <span className="text-lg font-black tracking-[0.2em]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  MH Clothing
                </span>
                <button onClick={() => setMobileOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`
                  }
                >
                  Home
                </NavLink>

                {/* Sections with their categories */}
                {NAV_SECTIONS.map((section) => {
                  const cats = groupedCategories[section] || [];
                  return (
                    <div key={section}>
                      {/* Section header — links to section page */}
                      <Link
                        to={`/${section}`}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 capitalize transition-colors"
                      >
                        {section}
                        <span className="text-[10px] text-gray-400 font-normal">View all</span>
                      </Link>

                      {/* Sub-categories */}
                      {cats.length > 0 && (
                        <div className="ml-3 pl-3 border-l border-gray-100 space-y-0.5 mb-1">
                          {cats.map((cat) => (
                            <button
                              key={cat._id}
                              onClick={() => navigate(`/category/${cat._id}`)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-left"
                            >
                              {cat.image && (
                                <img
                                  src={resolveImg(cat.image)}
                                  alt={cat.name}
                                  className="w-6 h-6 rounded-md object-cover border border-gray-100 shrink-0"
                                />
                              )}
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {STATIC_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                {/* Track Order */}
                <NavLink
                  to="/track"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`
                  }
                >
                  <MapPin size={16} className="text-amber-600" />
                  Track Order
                </NavLink>

              </nav>

              <div className="p-4 border-t border-gray-100 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <User size={18} /> My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-amber-700 hover:bg-amber-50"
                      >
                        <LayoutDashboard size={18} className="text-amber-500" /> Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <User size={18} /> Login / Register
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
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
