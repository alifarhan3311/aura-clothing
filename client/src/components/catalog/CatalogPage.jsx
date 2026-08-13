import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Loader2, PackageX, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalogApi, categoryApi } from '../../lib/api';
import Newsletter from '../home/Newsletter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function img(p) {
  if (!p) return null;
  return p.startsWith('http') ? p : `${API_BASE}${p}`;
}

const pkr = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

// ── Section hero config ───────────────────────────────────────────────────────
const HERO = {
  women: {
    label: 'Her Collection', title: "Women's Edit",
    bg: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=70',
    gradient: 'linear-gradient(135deg,#f7f0e8,#fdf0ed)',
  },
  men: {
    label: 'His Collection', title: "Men's Edit",
    bg: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=70',
    gradient: 'linear-gradient(135deg,#eef2f7,#e8eef5)',
  },
  kids: {
    label: 'Little Ones', title: "Kids' Edit",
    bg: 'https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=1600&q=70',
    gradient: 'linear-gradient(135deg,#fdf0ed,#fff8f0)',
  },
};

const SORTS = [
  { label: 'Newest First',      value: 'createdAt_desc' },
  { label: 'Oldest First',      value: 'createdAt_asc'  },
  { label: 'Price: Low → High', value: 'price_asc'      },
  { label: 'Price: High → Low', value: 'price_desc'     },
  { label: 'Name A–Z',          value: 'name_asc'       },
];

// ── Product card ──────────────────────────────────────────────────────────────
function Card({ product: p }) {
  const navigate  = useNavigate();
  const v         = p.variants?.[0];
  const price     = v?.price    ?? 0;
  const disc      = v?.discount ?? 0;
  const salePrice = disc > 0 ? Math.round(price * (1 - disc / 100)) : null;

  return (
    <div
      onClick={() => navigate(`/product/${p._id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
    >
      <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
        {img(p.mainImage) ? (
          <img
            src={img(p.mainImage)}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <PackageX size={36} />
          </div>
        )}
        {disc > 0 && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-rose-500 text-white rounded-full">
            -{disc}%
          </span>
        )}
        {p.isFeatured && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">
            ★ Featured
          </span>
        )}
        {p.images?.length > 0 && (
          <span className="absolute bottom-2 right-2 text-[9px] font-bold px-1.5 py-0.5 bg-black/50 text-white rounded-full">
            +{p.images.length} photos
          </span>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">
          {typeof p.brand === 'object' ? p.brand?.name : ''}
        </p>
        <h3 className="text-xs font-bold text-gray-900 line-clamp-1 mb-1.5 group-hover:text-amber-700 transition-colors">
          {p.name}
        </h3>
        {p.colors?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {p.colors.slice(0, 4).map((c) => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">{c}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{pkr(salePrice ?? price)}</span>
          {salePrice && <span className="text-xs text-gray-400 line-through">{pkr(price)}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Filter sidebar ────────────────────────────────────────────────────────────
function Sidebar({ filters, cats, active, onFilter }) {
  const tog = (key, val) => {
    const cur  = active[key] ? active[key].split(',') : [];
    const next = cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val];
    onFilter({ [key]: next.join(',') || undefined });
  };
  const checked = (key, val) => (active[key] || '').split(',').includes(val);

  const dirty = Object.keys(active).some((k) => !['page','sortBy','order'].includes(k) && active[k]);

  return (
    <div className="space-y-5 text-xs">

      {/* Category */}
      {cats.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Category</h4>
          <div className="space-y-0.5">
            {cats.map((c) => {
              const on = active.category === c._id;
              return (
                <button
                  key={c._id}
                  onClick={() => onFilter({ category: on ? undefined : c._id })}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                    on ? 'bg-[#f0e4cc] text-amber-900 border border-[#c9a96e]/30' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {on && <span className="text-amber-600 shrink-0">✓</span>}
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand */}
      {filters.brands?.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Brand</h4>
          <div className="space-y-1">
            {filters.brands.map((b) => (
              <label key={b._id} className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-lg">
                <input type="checkbox" checked={checked('brand', b._id)} onChange={() => tog('brand', b._id)} className="accent-[#c9a96e] w-3.5 h-3.5" />
                <span className="text-gray-700 font-medium">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {filters.sizes?.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Size</h4>
          <div className="flex flex-wrap gap-1.5">
            {filters.sizes.map((s) => (
              <button key={s} onClick={() => tog('size', s)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                  checked('size', s) ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                }`}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Color */}
      {filters.colors?.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Color</h4>
          <div className="flex flex-wrap gap-1.5">
            {filters.colors.map((c) => (
              <button key={c} onClick={() => tog('color', c)}
                className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                  checked('color', c) ? 'border-[#c9a96e] bg-[#f0e4cc] text-amber-900' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                }`}
              >{c}</button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      {filters.priceRange?.max > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Price (PKR)</h4>
          <p className="text-[10px] text-gray-400 mb-1.5">{pkr(filters.priceRange.min)} — {pkr(filters.priceRange.max)}</p>
          <div className="flex gap-1.5">
            <input type="number" placeholder="Min" value={active.minPrice || ''} onChange={(e) => onFilter({ minPrice: e.target.value || undefined, page: 1 })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#c9a96e] bg-white" />
            <input type="number" placeholder="Max" value={active.maxPrice || ''} onChange={(e) => onFilter({ maxPrice: e.target.value || undefined, page: 1 })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#c9a96e] bg-white" />
          </div>
        </div>
      )}

      {/* Clear */}
      {dirty && (
        <button
          onClick={() => onFilter({ category: undefined, brand: undefined, size: undefined, color: undefined, minPrice: undefined, maxPrice: undefined, page: 1 })}
          className="w-full text-[11px] font-semibold text-rose-500 border border-rose-200 py-2 rounded-xl hover:bg-rose-50 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CatalogPage({ section }) {
  const navigate                        = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [drawer,       setDrawer]       = useState(false);
  // active category object (for hero override)
  const [activeCat,    setActiveCat]    = useState(null);
  const catFetchRef                     = useRef(null);

  const hero   = HERO[section] || HERO.women;
  const active = Object.fromEntries(searchParams.entries());

  // When ?category=ObjectId changes, fetch that category for hero display
  useEffect(() => {
    const catId = active.category;
    if (!catId) { setActiveCat(null); return; }
    // avoid duplicate fetches
    if (catFetchRef.current === catId) return;
    catFetchRef.current = catId;
    categoryApi.getById(catId)
      .then((res) => setActiveCat(res.category || res))
      .catch(() => setActiveCat(null));
  }, [active.category]);

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

  // Fetch products whenever params change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = Object.fromEntries(searchParams.entries());
    catalogApi.getBySection(section, { limit: 16, ...params })
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [section, searchParams]);

  const [sortVal, setSortVal] = useState(`${active.sortBy || 'createdAt'}_${active.order || 'desc'}`);
  const handleSort = (val) => {
    setSortVal(val);
    const [s, o] = val.split('_');
    updateFilter({ sortBy: s, order: o });
  };

  const page       = parseInt(active.page || '1');
  const totalPages = data?.totalPages || 1;
  const cats       = data?.categories || [];
  const filters    = data?.filters    || { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } };
  const dirtyCount = Object.keys(active).filter((k) => !['page','sortBy','order'].includes(k) && active[k]).length;

  // Hero: if category is active, use its data; otherwise use section config
  const heroBg    = activeCat?.image ? img(activeCat.image) : hero.bg;
  const heroTitle = activeCat ? activeCat.name : hero.title;
  const heroLabel = activeCat ? (activeCat.section?.charAt(0).toUpperCase() + activeCat.section?.slice(1)) : hero.label;
  const isCatActive = Boolean(active.category);

  return (
    <main>
      {/* ── Hero ── */}
      <div
        className={`relative flex items-end overflow-hidden ${isCatActive ? 'bg-gray-900' : ''}`}
        style={{
          height: '100vh',
          maxHeight: '600px',
          ...(!isCatActive ? { background: hero.gradient } : {}),
        }}
      >
        <img
          src={heroBg}
          alt={heroTitle}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${isCatActive ? 'opacity-40' : 'opacity-30'}`}
        />
        {isCatActive && (
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
        )}
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 w-full ${isCatActive ? 'pb-7' : 'py-8'}`}>
          {/* Back button when category is active */}
          {isCatActive && (
            <button
              onClick={() => updateFilter({ category: undefined })}
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-[11px] font-medium mb-3 transition-colors"
            >
              <ArrowLeft size={13} /> All {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          )}
          <p className={`text-xs font-semibold tracking-[0.35em] uppercase mb-2 ${isCatActive ? 'text-amber-400' : 'text-amber-700'}`}>
            {heroLabel}
          </p>
          <h1
            className={`text-4xl sm:text-5xl font-bold ${isCatActive ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {heroTitle}
          </h1>
          {activeCat?.description && (
            <p className="text-white/50 text-xs mt-1.5 max-w-lg hidden sm:block">{activeCat.description}</p>
          )}
          <p className={`text-sm mt-2 ${isCatActive ? 'text-white/40' : 'text-gray-600'}`}>
            {loading ? 'Loading…' : `${data?.total ?? 0} styles available`}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Topbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button
            onClick={() => setDrawer(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:border-gray-400 bg-white transition-colors lg:hidden"
          >
            <SlidersHorizontal size={14} /> Filters
            {dirtyCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {dirtyCount}
              </span>
            )}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">Sort by:</span>
            <div className="relative">
              <select
                value={sortVal}
                onChange={(e) => handleSort(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 cursor-pointer"
              >
                {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Filters</h3>
              <Sidebar filters={filters} cats={cats} active={active} onFilter={updateFilter} />
            </div>
          </aside>

          {/* ── Mobile drawer ── */}
          <AnimatePresence>
            {drawer && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setDrawer(false)}
                />
                <motion.div
                  className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col lg:hidden"
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
                    <button onClick={() => setDrawer(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5">
                    <Sidebar filters={filters} cats={cats} active={active} onFilter={(f) => { updateFilter(f); setDrawer(false); }} />
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <button onClick={() => setDrawer(false)} className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-[#c9a96e] transition-colors">
                      View Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Products ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 size={28} className="animate-spin text-[#c9a96e]" />
              </div>
            ) : !data?.products?.length ? (
              <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
                <PackageX size={48} className="text-gray-200" />
                <p className="text-sm text-gray-500 font-medium">No products found.</p>
                {dirtyCount > 0 && (
                  <button onClick={() => setSearchParams({})} className="text-xs font-semibold text-[#c9a96e] hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.products.map((p) => <Card key={p._id} product={p} />)}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button disabled={page <= 1} onClick={() => updateFilter({ page: page - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 bg-white transition-colors">
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} onClick={() => updateFilter({ page: n })}
                        className={`w-8 h-8 text-xs font-bold rounded-xl border transition-all ${n === page ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white hover:border-gray-400 text-gray-600'}`}>
                        {n}
                      </button>
                    ))}
                    <button disabled={page >= totalPages} onClick={() => updateFilter({ page: page + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 bg-white transition-colors">
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
