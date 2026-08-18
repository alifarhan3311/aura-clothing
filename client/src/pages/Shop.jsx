import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal, X, ChevronDown, Loader2, PackageX,
  Heart, ShoppingBag, ChevronUp, Search, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalogApi, categoryApi, departmentApi } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Newsletter from '../components/home/Newsletter';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ri = (p) => (!p ? null : p.startsWith('http') ? p : `${API_BASE}${p}`);
const pkr = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

// ── Default Config Fallback ───────────────────────────────────────────────────
const DEFAULT_SECTIONS = [
  {
    key: 'women',
    label: 'Women',
    icon: '👗',
    bg: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=70',
    accent: '#f0e4cc',
  },
  {
    key: 'men',
    label: 'Men',
    icon: '👔',
    bg: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=70',
    accent: '#e8eef5',
  },
  {
    key: 'kids',
    label: 'Kids',
    icon: '👦',
    bg: 'https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=1600&q=70',
    accent: '#fdf0ed',
  },
];

const SHOP_HERO = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=70';

const SORTS = [
  { label: 'Newest First', value: 'createdAt_desc' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
];

// Color name to CSS color map (fallback)
const COLOR_MAP = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  black: '#1a1a1a', white: '#f8f8f8', gray: '#9ca3af', grey: '#9ca3af',
  pink: '#ec4899', purple: '#a855f7', orange: '#f97316', brown: '#92400e',
  navy: '#1e3a5f', maroon: '#7f1d1d', beige: '#d4b483', cream: '#fdf8ee',
  teal: '#14b8a6', cyan: '#06b6d4', gold: '#c9a96e', silver: '#94a3b8',
  olive: '#65a30d', mint: '#6ee7b7', lavender: '#c4b5fd', coral: '#fb7185',
  khaki: '#a3864b', rust: '#c2410c', rose: '#f43f5e', indigo: '#6366f1',
  violet: '#8b5cf6', lime: '#84cc16', amber: '#f59e0b', emerald: '#10b981',
};

function getColorHex(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

// ── Premium Product Card ──────────────────────────────────────────────────────
function ShopCard({ p }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const wishlisted = isWishlisted(p._id);

  const v = p.variants?.[0];
  const price = v?.price ?? 0;
  const disc = v?.discount ?? 0;
  const sale = disc > 0 ? Math.round(price * (1 - disc / 100)) : null;

  const variantColors = p.variants
    ? [...new Set(p.variants.map((vr) => vr.color).filter(Boolean))]
    : (p.colors || []);

  const handleAdd = (e) => {
    e.stopPropagation();
    const firstSize = p.variants?.[0]?.size || 'Free Size';
    const product = {
      _id: p._id,
      name: p.name,
      image: ri(p.mainImage),
      price: sale ?? price,
      salePrice: sale,
      onSale: !!sale,
      sizes: p.variants ? [...new Set(p.variants.map((vr) => vr.size).filter(Boolean))] : [],
    };
    addToCart(product, firstSize, 1);
    toast.success(`${p.name} added to bag!`, {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', borderRadius: '10px', background: '#1a1a1a', color: '#fff' },
      iconTheme: { primary: '#c9a96e', secondary: '#fff' },
    });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    const product = { _id: p._id, name: p.name, image: ri(p.mainImage), price: sale ?? price };
    toggleWishlist(product);
    toast(wishlisted ? 'Removed from wishlist' : '♡ Added to wishlist', {
      style: { fontFamily: 'Inter', fontSize: '13px', borderRadius: '10px', background: wishlisted ? '#6b6b6b' : '#e8a598', color: '#fff' },
    });
  };

  return (
    <motion.div
      onClick={() => navigate(`/product/${p._id}`)}
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{ boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.12)' : '0 1px 6px rgba(0,0,0,0.07)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {ri(p.mainImage) ? (
          <img
            src={ri(p.mainImage)}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <PackageX size={40} />
          </div>
        )}

        {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-black/10 transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {disc > 0 && (
            <span className="text-[10px] font-bold px-2.5 py-1 bg-rose-500 text-white rounded-full shadow-sm">
              -{disc}% OFF
            </span>
          )}
          {p.isFeatured && !disc && (
            <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500 text-white rounded-full shadow-sm flex items-center gap-1">
              <Sparkles size={8} /> Featured
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <Heart size={15} className={wishlisted ? 'fill-rose-400 text-rose-400' : 'text-gray-500'} />
        </button>

        {/* Hover CTA */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-all duration-300"
          style={{ transform: hovered ? 'translateY(0)' : 'translateY(110%)', opacity: hovered ? 1 : 0 }}
        >
          <button
            onClick={handleAdd}
            className="flex-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-900 hover:text-white transition-colors duration-200"
          >
            <ShoppingBag size={13} /> Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        {/* Brand */}
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5 truncate">
          {typeof p.brand === 'object' ? p.brand?.name : (p.brandName || '')}
        </p>
        {/* Name */}
        <h3 className="text-xs font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-amber-700 transition-colors">
          {p.name}
        </h3>

        {/* Color swatches */}
        {variantColors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {variantColors.slice(0, 6).map((c) => {
              const hex = getColorHex(c);
              return hex ? (
                <span
                  key={c}
                  title={c}
                  className="w-4 h-4 rounded-full border border-gray-200 shadow-sm inline-block"
                  style={{ backgroundColor: hex, borderColor: hex === '#f8f8f8' ? '#e0e0e0' : hex }}
                />
              ) : (
                <span key={c} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">
                  {c}
                </span>
              );
            })}
            {variantColors.length > 6 && (
              <span className="text-[9px] text-gray-400 font-medium">+{variantColors.length - 6}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-gray-900">{pkr(sale ?? price)}</span>
          {sale && (
            <span className="text-[11px] text-gray-400 line-through">{pkr(price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Collapsible Filter Section ────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between mb-3"
      >
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Filter Sidebar ────────────────────────────────────────────────────────────
function Sidebar({ filters, cats, active, onFilter }) {
  const tog = (key, val) => {
    const cur = active[key] ? active[key].split(',') : [];
    const next = cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val];
    onFilter({ [key]: next.join(',') || undefined });
  };
  const chk = (key, val) => (active[key] || '').split(',').includes(val);
  const dirty = Object.keys(active).some((k) => !['page', 'sortBy', 'order', 'section'].includes(k) && active[k]);

  return (
    <div className="text-xs">

      {/* Category */}
      {cats.length > 0 && (
        <FilterSection title="Category">
          <div className="space-y-0.5">
            {cats.map((c) => {
              const on = active.category === c._id;
              return (
                <button
                  key={c._id}
                  onClick={() => onFilter({ category: on ? undefined : c._id })}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                    on ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {on && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                  {!on && <span className="w-1.5 h-1.5 rounded-full bg-gray-200 shrink-0" />}
                  {c.name}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Brand */}
      {filters.brands?.length > 0 && (
        <FilterSection title="Brand" defaultOpen={false}>
          <div className="space-y-1">
            {filters.brands.map((b) => (
              <label key={b._id} className="flex items-center gap-2.5 px-1 py-1.5 cursor-pointer hover:bg-gray-50 rounded-lg">
                <div
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    chk('brand', b._id) ? 'bg-amber-500 border-amber-500' : 'border-gray-300'
                  }`}
                >
                  {chk('brand', b._id) && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" className="hidden" checked={chk('brand', b._id)} onChange={() => tog('brand', b._id)} />
                <span className="text-gray-700 font-medium text-[11px]">{b.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Size */}
      {filters.sizes?.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-1.5">
            {filters.sizes.map((s) => (
              <button
                key={s}
                onClick={() => tog('size', s)}
                className={`px-3 py-1.5 rounded-lg border-2 text-[11px] font-bold transition-all ${
                  chk('size', s)
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Color */}
      {filters.colors?.length > 0 && (
        <FilterSection title="Color" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {filters.colors.map((c) => {
              const hex = getColorHex(c);
              const on = chk('color', c);
              return hex ? (
                <button
                  key={c}
                  onClick={() => tog('color', c)}
                  title={c}
                  className={`relative w-7 h-7 rounded-full transition-all ${
                    on ? 'ring-2 ring-offset-2 ring-amber-500 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: hex, border: hex === '#f8f8f8' ? '1px solid #e0e0e0' : 'none' }}
                >
                  {on && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke={hex === '#f8f8f8' || hex === '#fdf8ee' ? '#1a1a1a' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              ) : (
                <button
                  key={c}
                  onClick={() => tog('color', c)}
                  className={`px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all ${
                    on ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      {filters.priceRange?.max > 0 && (
        <FilterSection title="Price (PKR)" defaultOpen={false}>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 mb-1 block">Min</label>
              <input
                type="number"
                placeholder="0"
                value={active.minPrice || ''}
                onChange={(e) => onFilter({ minPrice: e.target.value || undefined, page: 1 })}
                className="w-full px-2.5 py-2 border-2 border-gray-200 rounded-xl text-[11px] focus:outline-none focus:border-amber-400 bg-white transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 mb-1 block">Max</label>
              <input
                type="number"
                placeholder="Any"
                value={active.maxPrice || ''}
                onChange={(e) => onFilter({ maxPrice: e.target.value || undefined, page: 1 })}
                className="w-full px-2.5 py-2 border-2 border-gray-200 rounded-xl text-[11px] focus:outline-none focus:border-amber-400 bg-white transition-colors"
              />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">Range: {pkr(filters.priceRange.min)} — {pkr(filters.priceRange.max)}</p>
        </FilterSection>
      )}

      {dirty && (
        <button
          onClick={() => onFilter({ category: undefined, brand: undefined, size: undefined, color: undefined, minPrice: undefined, maxPrice: undefined, page: 1 })}
          className="w-full mt-2 text-[11px] font-bold text-rose-500 border-2 border-rose-200 py-2.5 rounded-xl hover:bg-rose-50 transition-colors"
        >
          ✕ Clear All Filters
        </button>
      )}
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-100 rounded-2xl aspect-[3/4] mb-3" />
      <div className="h-2 bg-gray-100 rounded w-1/3 mb-2" />
      <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="flex gap-1 mb-2">
        <div className="w-4 h-4 bg-gray-100 rounded-full" />
        <div className="w-4 h-4 bg-gray-100 rounded-full" />
        <div className="w-4 h-4 bg-gray-100 rounded-full" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionsList, setSectionsList] = useState(DEFAULT_SECTIONS);
  const catRef = useRef(null);
  const navigate = useNavigate();

  const active = Object.fromEntries(searchParams.entries());
  const section = active.section || null;

  // Load departments dynamically
  useEffect(() => {
    departmentApi
      .getAll()
      .then((res) => {
        if (res.departments && res.departments.length > 0) {
          const list = res.departments.map((d) => ({
            key: d.slug,
            label: d.name,
            icon: d.icon || '✨',
            bg: ri(d.image) || SHOP_HERO,
            accent: '#f0e4cc',
          }));
          setSectionsList(list);
        }
      })
      .catch(() => {});
  }, []);

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

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      updateFilter({ search: searchQuery.trim() });
      setSearchOpen(false);
    }
  };

  // fetch products
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = { ...Object.fromEntries(searchParams.entries()), limit: 16 };
    delete params.section;

    const fetchAll = async () => {
      if (section) {
        const res = await catalogApi.getBySection(section, params);
        return res;
      }
      const results = await Promise.allSettled(
        sectionsList.map((s) => catalogApi.getBySection(s.key, params))
      );
      const allProducts = [];
      const allCats = [];
      const brandMap = new Map();
      const sizeSet = new Set();
      const colorSet = new Set();
      let priceMin = Infinity, priceMax = 0;

      results.forEach((r) => {
        if (r.status !== 'fulfilled') return;
        (r.value.products || []).forEach((p) => allProducts.push(p));
        (r.value.categories || []).forEach((c) => allCats.push(c));
        const f = r.value.filters || {};
        (f.brands || []).forEach((b) => brandMap.set(b._id, b));
        (f.sizes || []).forEach((s) => sizeSet.add(s));
        (f.colors || []).forEach((c) => colorSet.add(c));
        if (f.priceRange?.min < priceMin) priceMin = f.priceRange.min;
        if (f.priceRange?.max > priceMax) priceMax = f.priceRange.max;
      });

      return {
        products: allProducts,
        categories: allCats,
        total: allProducts.length,
        totalPages: 1,
        filters: {
          brands: [...brandMap.values()],
          sizes: [...sizeSet].sort(),
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
  }, [section, searchParams, sectionsList]);

  const [sortVal, setSortVal] = useState('createdAt_desc');
  const handleSort = (val) => {
    setSortVal(val);
    const [s, o] = val.split('_');
    updateFilter({ sortBy: s, order: o });
  };

  const pg = parseInt(active.page || '1');
  const totalPages = data?.totalPages || 1;
  const cats = data?.categories || [];
  const filters = data?.filters || { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } };

  // Active filter chips (excluding page/sort/section)
  const activeFilterKeys = Object.keys(active).filter((k) =>
    !['page', 'sortBy', 'order', 'section'].includes(k) && active[k]
  );
  const dirtyCount = activeFilterKeys.length;

  return (
    <main>

      {/* ── Section Tabs ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-2.5 overflow-x-auto scrollbar-none">
            {/* All tab */}
            <button
              onClick={() => updateFilter({ section: undefined, category: undefined })}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                !section
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              ✦ All
            </button>

            {sectionsList.map((s) => (
              <button
                key={s.key}
                onClick={() => updateFilter({ section: section === s.key ? undefined : s.key, category: undefined, page: 1 })}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  section === s.key
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}

            {/* Search button */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="shrink-0 ml-auto w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 bg-white transition-colors"
            >
              <Search size={14} className="text-gray-500" />
            </button>
          </div>

          {/* Inline search */}
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                onSubmit={handleSearch}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pb-3 flex gap-2"
              >
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none border border-gray-200 focus:border-amber-400 transition-colors"
                />
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors">
                  Search
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Topbar */}
        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
          {/* Left: filter button + active chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDrawer(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-2 border-gray-200 rounded-xl hover:border-gray-400 bg-white transition-all lg:hidden"
            >
              <SlidersHorizontal size={14} /> Filters
              {dirtyCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {dirtyCount}
                </span>
              )}
            </button>

            {/* Active filter chips */}
            <AnimatePresence>
              {activeFilterKeys.map((k) => (
                <motion.button
                  key={k}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={() => updateFilter({ [k]: undefined, page: 1 })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded-full hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                >
                  {k}: {active[k].length > 20 ? active[k].slice(0, 20) + '…' : active[k]}
                  <X size={10} />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Right: sort + count */}
          <div className="flex items-center gap-3 ml-auto">
            {!loading && data?.total != null && (
              <span className="text-xs text-gray-400 hidden sm:block">
                {data.total} results
              </span>
            )}
            <div className="relative">
              <select
                value={sortVal}
                onChange={(e) => handleSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-bold border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
              >
                {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* Desktop sidebar with independent scroll */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div className="sticky top-[120px] max-h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 shrink-0">
                <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                  <SlidersHorizontal size={15} /> Filters
                </h3>
                {dirtyCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {dirtyCount} active
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar">
                <Sidebar filters={filters} cats={cats} active={active} onFilter={updateFilter} />
              </div>
            </div>
          </aside>

          {/* Mobile drawer */}
          <AnimatePresence>
            {drawer && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setDrawer(false)}
                />
                <motion.div
                  className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-2xl flex flex-col lg:hidden"
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                      <SlidersHorizontal size={15} /> Filters
                    </h3>
                    <button onClick={() => setDrawer(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <Sidebar
                      filters={filters}
                      cats={cats}
                      active={active}
                      onFilter={(f) => { updateFilter(f); setDrawer(false); }}
                    />
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => setDrawer(false)}
                      className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      View Results {data?.total != null && `(${data.total})`}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : !data?.products?.length ? (
              <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
                  <PackageX size={36} className="text-gray-200" />
                </div>
                <p className="text-base font-bold text-gray-900">No products found</p>
                <p className="text-sm text-gray-400 max-w-xs">
                  {dirtyCount > 0
                    ? 'Try removing some filters to see more results.'
                    : 'Check back soon for new arrivals!'}
                </p>
                {dirtyCount > 0 && (
                  <button
                    onClick={() => setSearchParams({})}
                    className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-full hover:bg-amber-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.products.map((p, i) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                    >
                      <ShopCard p={p} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      disabled={pg <= 1}
                      onClick={() => updateFilter({ page: pg - 1 })}
                      className="px-4 py-2 text-xs font-bold border-2 border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 bg-white transition-colors"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => updateFilter({ page: n })}
                        className={`w-9 h-9 text-xs font-black rounded-xl border-2 transition-all ${
                          n === pg
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-white hover:border-gray-400 text-gray-600'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      disabled={pg >= totalPages}
                      onClick={() => updateFilter({ page: pg + 1 })}
                      className="px-4 py-2 text-xs font-bold border-2 border-gray-200 rounded-xl disabled:opacity-40 hover:border-gray-400 bg-white transition-colors"
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
