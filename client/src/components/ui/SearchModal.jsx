import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Loader2, ArrowRight, Sparkles, Tag, ShoppingBag,
  Clock, TrendingUp, AlertCircle, CornerDownLeft
} from 'lucide-react';
import { productApi } from '../../lib/api';

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

const QUICK_SUGGESTIONS = [
  'Shirt', 'Kurta', 'Jeans', 'T-Shirt', 'Dress', 'Summer Collection'
];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cacheSource, setCacheSource] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input on open & lock background scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setHasSearched(false);
      setCacheSource(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Global keyboard shortcuts: Cmd/Ctrl + K to open, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or custom event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Perform search with 300ms debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      setCacheSource(null);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productApi.search(trimmed);
        setResults(res.products || []);
        setCacheSource(res.source || null);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectProduct = (productId) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  const handleFullSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 mt-12 sm:mt-20 flex flex-col max-h-[82vh]"
        >
          {/* Search Header Bar */}
          <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <Search size={20} className="text-amber-600 shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFullSearch(e);
              }}
              placeholder="Search products by title, category, tags..."
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal outline-none"
            />

            {/* Clear button or Spinner */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {loading ? (
                <Loader2 size={18} className="animate-spin text-amber-600" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <X size={13} />
                </button>
              ) : null}

              {/* Esc Badge */}
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded-md shadow-2xs">
                ESC
              </kbd>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* 1. Loading Skeletons */}
            {loading && !results.length && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 animate-pulse border border-gray-100"
                  >
                    <div className="w-12 h-14 bg-gray-200 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="w-3/5 h-4 bg-gray-200 rounded" />
                      <div className="w-1/4 h-3 bg-gray-200 rounded" />
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* 2. Search Results List */}
            {!loading && results.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Found {results.length} Products</span>
                  {cacheSource && (
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ⚡ {cacheSource === 'redis' ? 'Cached (Redis)' : 'Live Search'}
                    </span>
                  )}
                </div>

                <div className="divide-y divide-gray-50 rounded-2xl overflow-hidden border border-gray-100 bg-white">
                  {results.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleSelectProduct(product._id)}
                      className="flex items-center justify-between gap-4 p-3 sm:p-3.5 hover:bg-amber-50/40 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-12 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200/80 flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={resolveImg(product.image)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <ShoppingBag size={18} className="text-gray-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              {product.category || 'Apparel'}
                            </span>
                            {product.brand && (
                              <span className="text-[11px] text-gray-400 truncate">
                                • {product.brand}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Arrow */}
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <p className="text-sm font-extrabold text-gray-900">
                            PKR {product.price?.toLocaleString()}
                          </p>
                          {product.discount > 0 && product.originalPrice > product.price && (
                            <p className="text-[10px] text-gray-400 line-through">
                              PKR {product.originalPrice?.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-gray-400 transition-colors">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <button
                  onClick={handleFullSearch}
                  className="w-full py-3 mt-2 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 border border-gray-100"
                >
                  <span>View all results for "{query}"</span>
                  <CornerDownLeft size={13} className="text-gray-400" />
                </button>
              </div>
            )}

            {/* 3. Empty State (No results found) */}
            {!loading && hasSearched && results.length === 0 && query.trim() && (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle size={26} />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">No products found for "{query}"</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Try checking your spelling or searching with broader keywords like shirt, kurta, or collection.
                  </p>
                </div>

                {/* Quick suggestions */}
                <div className="pt-4 border-t border-gray-100 max-w-md mx-auto">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                    Suggested Searches
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {QUICK_SUGGESTIONS.map((item) => (
                      <button
                        key={item}
                        onClick={() => setQuery(item)}
                        className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-amber-800 border border-gray-200/80 text-xs font-medium text-gray-700 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Initial State (When input is empty) */}
            {!query.trim() && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <TrendingUp size={13} className="text-amber-600" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SUGGESTIONS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-amber-900 border border-gray-100 hover:border-amber-200 text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles size={11} className="text-amber-500" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Categories Navigation */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Explore Departments
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Women's Collection", path: '/shop?section=women' },
                      { name: "Men's Collection", path: '/shop?section=men' },
                      { name: "Kids & Teens", path: '/shop?section=kids' },
                    ].map((dept) => (
                      <button
                        key={dept.name}
                        onClick={() => {
                          onClose();
                          navigate(dept.path);
                        }}
                        className="p-3 rounded-2xl bg-gray-50/70 hover:bg-gray-100 text-left border border-gray-100 transition-colors group"
                      >
                        <p className="text-xs font-bold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                          {dept.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          Browse Collection <ArrowRight size={10} />
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Tips */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px]">↵</kbd> to search all
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px]">ESC</kbd> to close
              </span>
            </div>
            <span className="font-semibold text-gray-500">Fade Find Search Engine</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
