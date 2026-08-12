import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Loader2, PackageX } from 'lucide-react';
import { catalogApi } from '../../lib/api';
import Newsletter from '../home/Newsletter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const formatPrice = (p) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(p);

// ── Hero configs per section ──────────────────────────────────────────────────
const SECTION_CONFIG = {
  women: {
    label: 'Her Collection',
    title: "Women's Edit",
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=70',
    gradient: 'linear-gradient(135deg, #f7f0e8 0%, #fdf0ed 100%)',
  },
  men: {
    label: 'His Collection',
    title: "Men's Edit",
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=70',
    gradient: 'linear-gradient(135deg, #eef2f7 0%, #e8eef5 100%)',
  },
  kids: {
    label: 'Little Ones',
    title: "Kids' Edit",
    image: 'https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=1600&q=70',
    gradient: 'linear-gradient(135deg, #fdf0ed 0%, #fff8f0 100%)',
  },
  home: {
    label: 'Home & Living',
    title: 'Home Edit',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=70',
    gradient: 'linear-gradient(135deg, #f0f4f0 0%, #f5f5f0 100%)',
  },
};

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt_desc' },
  { label: 'Oldest First', value: 'createdAt_asc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
];

// ── Small product card ────────────────────────────────────────────────────────
function CatalogCard({ product }) {
  const navigate = useNavigate();
  const variant = product.variants?.[0];
  const price = variant?.price ?? 0;
  const discount = variant?.discount ?? 0;
  const salePrice = discount > 0 ? price * (1 - discount / 100) : null;
  const img = resolveImg(product.mainImage);

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
    >
      <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <PackageX size={40} />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-rose-500 text-white rounded-full">
            -{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">
            ★ Featured
          </span>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">
          {typeof product.brand === 'object' ? product.brand.name : ''}
        </p>
        <h3 className="text-xs font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        {/* Colors */}
        {product.colors?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(salePrice ?? price)}
          </span>
          {salePrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Filter sidebar ────────────────────────────────────────────────────────────
function FilterSidebar({ filters, activeFilters, onFilter, categories, onClose }) {
  const toggle = (key, value) => {
    const current = activeFilters[key] ? activeFilters[key].split(',') : [];
    const idx = current.indexOf(value);
    const next = idx === -1 ? [...current, value] : current.filter((v) => v !== value);
    onFilter({ [key]: next.join(',') || undefined });
  };

  const isActive = (key, value) => {
    return (activeFilters[key] || '').split(',').includes(value);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Category</h4>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onFilter({ category: isActive('category', cat.slug) ? undefined : cat.slug })}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  (activeFilters.category === cat.slug)
                    ? 'bg-[#f0e4cc] text-amber-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {filters.brands?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Brand</h4>
          <div className="space-y-1">
            {filters.brands.map((b) => (
              <label key={b._id} className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={isActive('brand', b._id)}
                  onChange={() => toggle('brand', b._id)}
                  className="accent-[#c9a96e] w-3.5 h-3.5"
                />
                <span className="text-gray-700 font-medium">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {filters.sizes?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Size</h4>
          <div className="flex flex-wrap gap-1.5">
            {filters.sizes.map((s) => (
              <button
                key={s}
                onClick={() => toggle('size', s)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                  isActive('size', s)
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {filters.colors?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Color</h4>
          <div className="flex flex-wrap gap-1.5">
            {filters.colors.map((c) => (
              <button
                key={c}
                onClick={() => toggle('color', c)}
                className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                  isActive('color', c)
                    ? 'border-[#c9a96e] bg-[#f0e4cc] text-amber-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      {filters.priceRange && filters.priceRange.max > 0 && (
        <div>
          <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-2">
            Price Range
          </h4>
          <div className="text-[11px] text-gray-500 mb-2">
            {formatPrice(filters.priceRange.min)} — {formatPrice(filters.priceRange.max)}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={activeFilters.minPrice || ''}
              onChange={(e) => onFilter({ minPrice: e.target.value || undefined, page: 1 })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
            />
            <input
              type="number"
              placeholder="Max"
              value={activeFilters.maxPrice || ''}
              onChange={(e) => onFilter({ maxPrice: e.target.value || undefined, page: 1 })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
            />
          </div>
        </div>
      )}

      {/* Clear all */}
      {Object.keys(activeFilters).some((k) => !['page', 'sortBy', 'order'].includes(k) && activeFilters[k]) && (
        <button
          onClick={() => onFilter({ category: undefined, brand: undefined, size: undefined, color: undefined, minPrice: undefined, maxPrice: undefined, page: 1 })}
          className="w-full text-xs font-semibold text-rose-500 hover:text-rose-700 border border-rose-200 hover:border-rose-400 py-2 rounded-xl transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

// ── Main CatalogPage component ────────────────────────────────────────────────
export default function CatalogPage({ section }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const config = SECTION_CONFIG[section] || SECTION_CONFIG.women;

  // Read all active query params
  const activeFilters = Object.fromEntries(searchParams.entries());

  // Update URL params
  const updateFilter = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v === undefined || v === '') {
            next.delete(k);
          } else {
            next.set(k, String(v));
          }
        });
        // Reset to page 1 on any filter change (unless explicitly set)
        if (!('page' in updates)) next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  // Fetch data whenever params change
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const params = Object.fromEntries(searchParams.entries());
        const res = await catalogApi.getBySection(section, { limit: 16, ...params });
        if (!cancelled) setData(res);
      } catch (err) {
        console.error('Catalog fetch error:', err.message);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [section, searchParams]);

  const [sortVal, setSortVal] = useState(
    `${activeFilters.sortBy || 'createdAt'}_${activeFilters.order || 'desc'}`
  );

  const handleSort = (val) => {
    setSortVal(val);
    const [sortBy, order] = val.split('_');
    updateFilter({ sortBy, order });
  };

  const currentPage = parseInt(activeFilters.page || '1');
  const totalPages = data?.totalPages || 1;

  return (
    <main>
      {/* ── Hero ── */}
      <div
        className="relative h-56 sm:h-72 flex items-center overflow-hidden"
        style={{ background: config.gradient }}
      >
        <img
          src={config.image}
          alt={config.title}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-25"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-2">
            {config.label}
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {config.title}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {loading ? 'Loading…' : `${data?.total ?? 0} styles available`}
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
            <span className="text-xs text-gray-400 hidden sm:block">Sort by:</span>
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
          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Filters</h3>
              <FilterSidebar
                filters={data?.filters || { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } }}
                activeFilters={activeFilters}
                onFilter={updateFilter}
                categories={data?.categories || []}
              />
            </div>
          </aside>

          {/* ── Mobile sidebar drawer ── */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="relative bg-white w-72 h-full overflow-y-auto p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
                  <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
                </div>
                <FilterSidebar
                  filters={data?.filters || { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } }}
                  activeFilters={activeFilters}
                  onFilter={(f) => { updateFilter(f); setSidebarOpen(false); }}
                  categories={data?.categories || []}
                />
              </div>
            </div>
          )}

          {/* ── Products grid ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={28} className="animate-spin text-[#c9a96e]" />
              </div>
            ) : !data?.products?.length ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <PackageX size={48} className="text-gray-200" />
                <p className="text-sm text-gray-500 font-medium">No products found for the selected filters.</p>
                <button
                  onClick={() => setSearchParams({})}
                  className="text-xs font-semibold text-[#c9a96e] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.products.map((p) => (
                    <CatalogCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => updateFilter({ page: currentPage - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 transition-colors"
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
                            : 'border-gray-200 hover:border-gray-400 text-gray-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => updateFilter({ page: currentPage + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 transition-colors"
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
