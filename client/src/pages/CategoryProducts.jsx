import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, PackageX, SlidersHorizontal, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { categoryApi } from '../lib/api';
import { normalizeProduct } from '../components/ui/ProductCard';
import Newsletter from '../components/home/Newsletter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const formatPrice = (p) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(p);

const SORT_OPTIONS = [
  { label: 'Newest First',        value: 'createdAt_desc' },
  { label: 'Oldest First',        value: 'createdAt_asc' },
  { label: 'Price: Low to High',  value: 'price_asc' },
  { label: 'Price: High to Low',  value: 'price_desc' },
  { label: 'Name A–Z',            value: 'name_asc' },
];

// ── Product card (for this page) ──────────────────────────────────────────────
function ProductCard({ product: raw }) {
  const navigate = useNavigate();
  const product = normalizeProduct(raw);
  if (!product) return null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22 }}
      onClick={() => navigate(`/product/${product._id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
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
        {/* Multiple images indicator */}
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
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">{c}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{formatPrice(product.salePrice ?? product.price)}</span>
          {product.onSale && <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CategoryProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeFilters = Object.fromEntries(searchParams.entries());
  const currentPage = parseInt(activeFilters.page || '1');
  const [sortVal, setSortVal] = useState(
    `${activeFilters.sortBy || 'createdAt'}_${activeFilters.order || 'desc'}`
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
        const res = await categoryApi.getProducts(id, { limit: 16, ...params });
        if (cancelled) return;
        setCategory(res.category || null);
        setProducts(res.products || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          setCategory(null);
        }
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

  const categoryImage = category?.image ? resolveImg(category.image) : null;

  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <div className="relative h-48 sm:h-64 flex items-center overflow-hidden bg-gradient-to-r from-gray-900 to-gray-700">
        {categoryImage && (
          <img
            src={categoryImage}
            alt={category?.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium mb-3 transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
          {category?.section && (
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-amber-400 mb-1 capitalize">
              {category.section}
            </p>
          )}
          <h1 className="text-3xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            {loading && !category ? 'Loading…' : (category?.name || 'Category')}
          </h1>
          {category?.description && (
            <p className="text-white/60 text-sm mt-2 max-w-lg">{category.description}</p>
          )}
          <p className="text-white/50 text-xs mt-2">
            {loading ? '…' : `${total} product${total !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-colors lg:hidden"
          >
            <SlidersHorizontal size={14} /> Filters
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

        <div className="flex gap-8">
          {/* ── Desktop filter sidebar ── */}
          <aside className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
              <h3 className="font-bold text-gray-900 text-sm">Filters</h3>

              {/* Price */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Price (PKR)</p>
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

              {Object.keys(activeFilters).some((k) => !['page','sortBy','order'].includes(k) && activeFilters[k]) && (
                <button
                  onClick={() => setSearchParams({})}
                  className="w-full text-xs font-semibold text-rose-500 border border-rose-200 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Mobile filter drawer ── */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="relative bg-white w-72 h-full overflow-y-auto p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
                  <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Price (PKR)</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={activeFilters.minPrice || ''} onChange={(e) => updateFilter({ minPrice: e.target.value || undefined })} className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none" />
                    <input type="number" placeholder="Max" value={activeFilters.maxPrice || ''} onChange={(e) => updateFilter({ maxPrice: e.target.value || undefined })} className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Size</p>
                  <input type="text" placeholder="e.g. S,M,L" value={activeFilters.size || ''} onChange={(e) => updateFilter({ size: e.target.value || undefined })} className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Color</p>
                  <input type="text" placeholder="e.g. Red,Blue" value={activeFilters.color || ''} onChange={(e) => updateFilter({ color: e.target.value || undefined })} className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none" />
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl">Apply</button>
              </div>
            </div>
          )}

          {/* ── Products grid ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={28} className="animate-spin text-[#c9a96e]" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <PackageX size={48} className="text-gray-200" />
                <p className="text-sm text-gray-500 font-medium">No products in this category yet.</p>
                <button onClick={() => navigate(-1)} className="text-xs font-semibold text-[#c9a96e] hover:underline flex items-center gap-1">
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => updateFilter({ page: currentPage - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 transition-colors"
                    >← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateFilter({ page: p })}
                        className={`w-8 h-8 text-xs font-bold rounded-xl border transition-all ${p === currentPage ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400 text-gray-600'}`}
                      >{p}</button>
                    ))}
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => updateFilter({ page: currentPage + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 transition-colors"
                    >Next →</button>
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
