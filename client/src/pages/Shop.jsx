import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Loader2, PackageX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalogApi, categoryApi } from '../lib/api';
import Newsletter from '../components/home/Newsletter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ri = (p) => (!p ? null : p.startsWith('http') ? p : `${API_BASE}${p}`);
const pkr = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

// ── Config ────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    key: 'women',
    label: 'Women',
    bg: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=70',
  },
  {
    key: 'men',
    label: 'Men',
    bg: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=70',
  },
  {
    key: 'kids',
    label: 'Kids',
    bg: 'https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=1600&q=70',
  },
];

const SHOP_HERO = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=70';

const SORTS = [
  { label: 'Newest First',      value: 'createdAt_desc' },
  { label: 'Price: Low → High', value: 'price_asc'      },
  { label: 'Price: High → Low', value: 'price_desc'     },
  { label: 'Name A–Z',          value: 'name_asc'       },
];

// ── Product Card ──────────────────────────────────────────────────────────────
function Card({ p }) {
  const navigate = useNavigate();
  const v     = p.variants?.[0];
  const price = v?.price    ?? 0;
  const disc  = v?.discount ?? 0;
  const sale  = disc > 0 ? Math.round(price * (1 - disc / 100)) : null;

  return (
    <div
      onClick={() => navigate(`/product/${p._id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
    >
      <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
        {ri(p.mainImage) ? (
          <img src={ri(p.mainImage)} alt={p.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300"><PackageX size={36} /></div>
        )}
        {disc > 0 && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-rose-500 text-white rounded-full">-{disc}%</span>}
        {p.isFeatured && <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">★ Featured</span>}
        {p.images?.length > 0 && <span className="absolute bottom-2 right-2 text-[9px] font-bold px-1.5 py-0.5 bg-black/50 text-white rounded-full">+{p.images.length} photos</span>}
      </div>
      <div className="p-3.5">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">
          {typeof p.brand === 'object' ? p.brand?.name : ''}
        </p>
        <h3 className="text-xs font-bold text-gray-900 line-clamp-1 mb-1.5 group-hover:text-amber-700 transition-colors">{p.name}</h3>
        {p.colors?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {p.colors.slice(0, 4).map((c) => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">{c}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{pkr(sale ?? price)}</span>
          {sale && <span className="text-xs text-gray-400 line-through">{pkr(price)}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Filter Sidebar ────────────────────────────────────────────────────────────
function Sidebar({ filters, cats, active, onFilter }) {
  const tog = (key, val) => {
    const cur  = active[key] ? active[key].split(',') : [];
    const next = cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val];
    onFilter({ [key]: next.join(',') || undefined });
  };
  const chk = (key, val) => (active[key] || '').split(',').includes(val);
  const dirty = Object.keys(active).some((k) => !['page','sortBy','order','section'].includes(k) && active[k]);

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
                <button key={c._id} onClick={() => onFilter({ category: on ? undefined : c._id })}
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
                <input type="checkbox" checked={chk('brand', b._id)} onChange={() => tog('brand', b._id)} className="accent-[#c9a96e] w-3.5 h-3.5" />
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
                  chk('size', s) ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                }`}>{s}</button>
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
                  chk('color', c) ? 'border-[#c9a96e] bg-[#f0e4cc] text-amber-900' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                }`}>{c}</button>
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
            <input type="number" placeholder="Min" value={active.minPrice || ''}
              onChange={(e) => onFilter({ minPrice: e.target.value || undefined, page: 1 })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#c9a96e] bg-white" />
            <input type="number" placeholder="Max" value={active.maxPrice || ''}
              onChange={(e) => onFilter({ maxPrice: e.target.value || undefined, page: 1 })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#c9a96e] bg-white" />
          </div>
        </div>
      )}

      {dirty && (
        <button
          onClick={() => onFilter({ category: undefined, brand: undefined, size: undefined, color: undefined, minPrice: undefined, maxPrice: undefined, page: 1 })}
          className="w-full text-[11px] font-semibold text-rose-500 border border-rose-200 py-2 rounded-xl hover:bg-rose-50 transition-colors"
        >Clear All Filters</button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawer,  setDrawer]  = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const catRef = useRef(null);

  const active  = Object.fromEntries(searchParams.entries());
  const section = active.section || null; // null = all sections

  // fetch active category info for display
  useEffect(() => {
    if (!active.category) { setActiveCat(null); return; }
    if (catRef.current === active.category) return;
    catRef.current = active.category;
    categoryApi.getById(active.category)
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

  // fetch products
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = { ...Object.fromEntries(searchParams.entries()), limit: 16 };
    delete params.section; // not a backend param

    const fetchFn = section
      ? catalogApi.getBySection(section, params)
      : catalogApi.getBySection('women', { ...params, allSections: true }); // fallback

    // If no section, fetch all three sections in parallel and merge
    const fetchAll = async () => {
      if (section) {
        const res = await catalogApi.getBySection(section, params);
        return res;
      }
      // No section selected — fetch all 3 sections and merge results
      const [w, m, k] = await Promise.allSettled([
        catalogApi.getBySection('women', params),
        catalogApi.getBySection('men',   params),
        catalogApi.getBySection('kids',  params),
      ]);
      const allProducts = [
        ...(w.status === 'fulfilled' ? w.value.products || [] : []),
        ...(m.status === 'fulfilled' ? m.value.products || [] : []),
        ...(k.status === 'fulfilled' ? k.value.products || [] : []),
      ];
      const allCats = [
        ...(w.status === 'fulfilled' ? w.value.categories || [] : []),
        ...(m.status === 'fulfilled' ? m.value.categories || [] : []),
        ...(k.status === 'fulfilled' ? k.value.categories || [] : []),
      ];
      // merge filters
      const brandMap = new Map();
      const sizeSet  = new Set();
      const colorSet = new Set();
      let priceMin = Infinity, priceMax = 0;
      [w, m, k].forEach((r) => {
        if (r.status !== 'fulfilled') return;
        const f = r.value.filters || {};
        (f.brands  || []).forEach((b) => brandMap.set(b._id, b));
        (f.sizes   || []).forEach((s) => sizeSet.add(s));
        (f.colors  || []).forEach((c) => colorSet.add(c));
        if (f.priceRange?.min < priceMin) priceMin = f.priceRange.min;
        if (f.priceRange?.max > priceMax) priceMax = f.priceRange.max;
      });
      return {
        products:   allProducts,
        categories: allCats,
        total:      allProducts.length,
        totalPages: 1,
        filters: {
          brands: [...brandMap.values()],
          sizes:  [...sizeSet].sort(),
          colors: [...colorSet].sort(),
          priceRange: { min: priceMin === Infinity ? 0 : priceMin, max: priceMax },
        },
      };
    };

    fetchAll()
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [section, searchParams]);

  const [sortVal, setSortVal] = useState('createdAt_desc');
  const handleSort = (val) => {
    setSortVal(val);
    const [s, o] = val.split('_');
    updateFilter({ sortBy: s, order: o });
  };

  const pg         = parseInt(active.page || '1');
  const totalPages = data?.totalPages || 1;
  const cats       = data?.categories || [];
  const filters    = data?.filters    || { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } };
  const dirtyCount = Object.keys(active).filter((k) => !['page','sortBy','order','section'].includes(k) && active[k]).length;

  // Hero display
  const activeSection = SECTIONS.find((s) => s.key === section);
  const heroBg    = activeCat?.image ? ri(activeCat.image) : (activeSection?.bg || SHOP_HERO);
  const heroTitle = activeCat ? activeCat.name : (activeSection ? activeSection.label + "'s Collection" : 'Shop All');
  const heroSub   = activeCat?.description || (activeSection ? null : 'Women · Men · Kids');

  return (
    <main>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gray-900" style={{ height: '100vh', maxHeight: '600px' }}>
        <img
          src={heroBg}
          alt={heroTitle}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />

        {/* Hero text — bottom */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <p className="text-xs font-bold tracking-[0.35em] uppercase text-amber-400 mb-2">
            {activeCat ? (activeCat.section?.charAt(0).toUpperCase() + activeCat.section?.slice(1)) : (activeSection ? activeSection.label : 'MH Clothing')}
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {heroTitle}
          </h1>
          {heroSub && <p className="text-white/50 text-sm">{heroSub}</p>}
          <p className="text-white/40 text-xs mt-2">
            {loading ? 'Loading…' : `${data?.total ?? 0} styles available`}
          </p>
        </div>
      </div>

      {/* ── Section Tabs (hero ke neeche) ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[68px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-none">
            {/* All tab */}
            <button
              onClick={() => updateFilter({ section: undefined, category: undefined })}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !section ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => updateFilter({ section: section === s.key ? undefined : s.key, category: undefined, page: 1 })}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  section === s.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}

            {/* Category pills if section is selected */}
            {cats.length > 0 && section && (
              <>
                <span className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
                {cats.map((c) => {
                  const on = active.category === c._id;
                  return (
                    <button
                      key={c._id}
                      onClick={() => updateFilter({ category: on ? undefined : c._id, page: 1 })}
                      className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        on
                          ? 'bg-[#c9a96e] text-white border-[#c9a96e]'
                          : 'border-gray-200 text-gray-600 hover:border-[#c9a96e] hover:text-amber-800'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </>
            )}
          </div>
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
              <select value={sortVal} onChange={(e) => handleSort(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none cursor-pointer">
                {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-36 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Filters</h3>
              <Sidebar filters={filters} cats={cats} active={active} onFilter={updateFilter} />
            </div>
          </aside>

          {/* Mobile drawer */}
          <AnimatePresence>
            {drawer && (
              <>
                <motion.div className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setDrawer(false)} />
                <motion.div className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col lg:hidden"
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

          {/* Products grid */}
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
                  {data.products.map((p) => <Card key={p._id} p={p} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button disabled={pg <= 1} onClick={() => updateFilter({ page: pg - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 bg-white">← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} onClick={() => updateFilter({ page: n })}
                        className={`w-8 h-8 text-xs font-bold rounded-xl border transition-all ${n === pg ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white hover:border-gray-400 text-gray-600'}`}>
                        {n}
                      </button>
                    ))}
                    <button disabled={pg >= totalPages} onClick={() => updateFilter({ page: pg + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 bg-white">Next →</button>
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
