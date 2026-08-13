import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Loader2, PackageX, SlidersHorizontal, X, ChevronDown, ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryApi } from '../lib/api';
import { normalizeProduct } from '../components/ui/ProductCard';
import Newsletter from '../components/home/Newsletter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(p) {
  if (!p) return null;
  return p.startsWith('http') ? p : `${API_BASE}${p}`;
}

const formatPrice = (p) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', maximumFractionDigits: 0,
  }).format(p);

const SORT_OPTIONS = [
  { label: 'Newest First',      value: 'createdAt_desc' },
  { label: 'Oldest First',      value: 'createdAt_asc'  },
  { label: 'Price: Low → High', value: 'price_asc'      },
  { label: 'Price: High → Low', value: 'price_desc'     },
  { label: 'Name A–Z',          value: 'name_asc'       },
];

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product: raw }) {
  const navigate = useNavigate();
  const product  = normalizeProduct(raw);
  if (!product) return null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/product/${product._id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <PackageX size={40} />
          </div>
        )}
        {product.onSale && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-rose-500 text-white rounded-full">
            -{product.discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">
            ★ Featured
          </span>
        )}
        {raw.images?.length > 0 && (
          <span className="absolute bottom-2 right-2 text-[9px] font-bold px-1.5 py-0.5 bg-black/50 text-white rounded-full">
            +{raw.images.length} photos
          </span>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">
          {product.brandName}
        </p>
        <h3 className="text-xs font-bold text-gray-900 line-clamp-1 mb-1.5 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        {product.colors?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(product.salePrice ?? product.price)}
          </span>
          {product.onSale && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Filter panel (desktop + mobile shared) ────────────────────────────────────
function FilterContent({ activeFilters, updateFilter, onApply }) {
  const hasAnyFilter = Object.keys(activeFilters).some(
    (k) => !['page', 'sortBy', 'order'].includes(k) && activeFilters[k],
  );

  return (
    <div className="space-y-5 text-xs">

      {/* Price */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Price (PKR)
        </p>
        <div className="flex gap-1.5">
          <input
            type="number" placeholder="Min"
            value={activeFilters.minPrice || ''}
            onChange={(e) => updateFilter({ minPrice: e.target.value || undefined })}
            className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
          />
          <input
            type="number" placeholder="Max"
            value={activeFilters.maxPrice || ''}
            onChange={(e) => updateFilter({ maxPrice: e.target.value || undefined })}
            className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
          />
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Size</p>
        <input
          type="text" placeholder="e.g. S,M,L"
          value={activeFilters.size || ''}
          onChange={(e) => updateFilter({ size: e.target.value || undefined })}
          className="w-full px-2.5 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
        />
      </div>

      {/* Color */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Color</p>
        <input
          type="text" placeholder="e.g. Red,Blue"
          value={activeFilters.color || ''}
          onChange={(e) => updateFilter({ color: e.target.value || undefined })}
          className="w-full px-2.5 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
        />
      </div>

      {/* Clear */}
      {hasAnyFilter && (
        <button
          onClick={() => {
            updateFilter({ minPrice: undefined, maxPrice: undefined, size: undefined, color: undefined, page: undefined });
            onApply?.();
          }}
          className="w-full text-[11px] font-semibold text-rose-500 border border-rose-200 py-2 rounded-xl hover:bg-rose-50 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CategoryProducts() {
  const { id }                            = useParams();
  const navigate                          = useNavigate();
  const [searchParams, setSearchParams]   = useSearchParams();

  const [category,   setCategory]   = useState(null);
  const [products,   setProducts]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeFilters = Object.fromEntries(searchParams.entries());
  const currentPage   = parseInt(activeFilters.page || '1');
  const [sortVal, setSortVal] = useState(
    `${activeFilters.sortBy || 'createdAt'}_${activeFilters.order || 'desc'}`,
  );

  const updateFilter = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === '') next.delete(k);
        else next.set(k, String(v));
      });
      if (!('page' in updates)) next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = Object.fromEntries(searchParams.entries());
        const res    = await categoryApi.getProducts(id, { limit: 16, ...params });
        if (cancelled) return;
        setCategory(res.category  || null);
        setProducts(res.products  || []);
        setTotal(res.total        || 0);
        setTotalPages(res.totalPages || 1);
      } catch {
        if (!cancelled) { setProducts([]); setCategory(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, searchParams]);

  const handleSort = (val) => {
    setSortVal(val);
    const [sortBy, order] = val.split('_');
    updateFilter({ sortBy, order });
  };

  const catImage = category?.image ? resolveImg(category.image) : null;
  const activeFilterCount = Object.keys(activeFilters).filter(
    (k) => !['page', 'sortBy', 'order'].includes(k) && activeFilters[k],
  ).length;

  return (
    <main className="min-h-screen bg-gray-50/40">

      {/* ── Hero ── */}
      <div className="relative h-52 sm:h-64 flex items-end overflow-hidden bg-gray-900">
        {catImage && (
          <img
            src={catImage}
            alt={category?.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pb-7">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-[11px] font-medium mb-3 transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
          {category?.section && (
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-amber-400 mb-1 capitalize">
              {category.section}
            </p>
          )}
          <h1
            className="text-3xl sm:text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {loading && !category ? 'Loading…' : (category?.name || 'Category')}
          </h1>
          {category?.description && (
            <p className="text-white/50 text-xs mt-1.5 max-w-lg hidden sm:block">
              {category.description}
            </p>
          )}
          <p className="text-white/40 text-[11px] mt-1.5">
            {loading ? '…' : `${total} product${total !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:border-gray-400 bg-white transition-colors lg:hidden"
          >
            <SlidersHorizontal size={14} /> Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">Sort:</span>
            <div className="relative">
              <select
                value={sortVal}
                onChange={(e) => handleSort(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-7">

          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Filters</h3>
              <FilterContent
                activeFilters={activeFilters}
                updateFilter={updateFilter}
              />
            </div>
          </aside>

          {/* ── Mobile drawer ── */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div
                  className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5">
                    <FilterContent
                      activeFilters={activeFilters}
                      updateFilter={updateFilter}
                      onApply={() => setSidebarOpen(false)}
                    />
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-[#c9a96e] transition-colors"
                    >
                      View Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Products grid ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 size={28} className="animate-spin text-[#c9a96e]" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
                <PackageX size={48} className="text-gray-200" />
                <p className="text-sm text-gray-500 font-medium">No products found.</p>
                {activeFilterCount > 0 && (
                  <button onClick={() => setSearchParams({})} className="text-xs font-semibold text-[#c9a96e] hover:underline">
                    Clear filters
                  </button>
                )}
                <button onClick={() => navigate(-1)} className="text-xs font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-1">
                  <ArrowLeft size={12} /> Go Back
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => updateFilter({ page: currentPage - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 transition-colors bg-white"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateFilter({ page: p })}
                        className={`w-8 h-8 text-xs font-bold rounded-xl border transition-all ${
                          p === currentPage
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-white hover:border-gray-400 text-gray-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => updateFilter({ page: currentPage + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 transition-colors bg-white"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Newsletter />
    </main>
  );
}
