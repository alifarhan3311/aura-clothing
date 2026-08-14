import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, Heart, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowLeft, Tag, Layers, Package, Loader2, Share2, ZoomIn, X, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productApi } from '../lib/api';
import { normalizeProduct } from '../components/ui/ProductCard';
import toast from 'react-hot-toast';

// Color name → CSS hex mapping
const COLOR_MAP = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  black: '#1a1a1a', white: '#f8f8f8', gray: '#9ca3af', grey: '#9ca3af',
  pink: '#ec4899', purple: '#a855f7', orange: '#f97316', brown: '#92400e',
  navy: '#1e3a5f', maroon: '#7f1d1d', beige: '#d4b483', cream: '#fdf8ee',
  teal: '#14b8a6', cyan: '#06b6d4', gold: '#c9a96e', silver: '#94a3b8',
  olive: '#65a30d', mint: '#6ee7b7', lavender: '#c4b5fd', coral: '#fb7185',
  khaki: '#a3864b', rust: '#c2410c', rose: '#f43f5e', indigo: '#6366f1',
  charcoal: '#374151', ivory: '#fffff0', mustard: '#d97706', peach: '#fca5a5',
};
function getColorHex(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const formatPrice = (p) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(p);

// ── Variants Accordion ────────────────────────────────────────────────────────
function VariantsAccordion({ variants, selectedSize, selectedColor, onSelect, formatPrice }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-7 pt-6 border-t border-gray-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-1 group"
      >
        <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 group-hover:text-gray-600 transition-colors">
          All Variants ({variants.length})
        </p>
        {open ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="variants"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden mt-3"
          >
            <div className="overflow-x-auto rounded-2xl border-2 border-gray-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b-2 border-gray-100">
                  <tr>
                    <th className="px-3 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Color</th>
                    <th className="px-3 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Size</th>
                    <th className="px-3 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {variants.map((v, i) => {
                    const isActive = selectedSize === v.size && selectedColor === v.color;
                    const discPrice = v.discount > 0 ? Math.round(v.price * (1 - v.discount / 100)) : v.price;
                    return (
                      <tr
                        key={v._id || i}
                        onClick={() => onSelect(v.color, v.size)}
                        className={`cursor-pointer transition-colors ${
                          isActive ? 'bg-amber-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <span className={`font-semibold ${isActive ? 'text-amber-800' : 'text-gray-700'}`}>
                            {v.color || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            isActive ? 'bg-amber-200 text-amber-900' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {v.size || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-black text-gray-900">{formatPrice(discPrice)}</span>
                          {v.discount > 0 && (
                            <span className="ml-1.5 text-[10px] text-rose-500 font-bold">-{v.discount}%</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`font-bold ${v.stock > 5 ? 'text-emerald-600' : v.stock > 0 ? 'text-amber-600' : 'text-rose-500'}`}>
                            {v.stock > 0 ? `${v.stock} pcs` : 'Out'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Keyboard nav for both gallery and lightbox
  useEffect(() => {
    const imgCount = raw
      ? [raw.mainImage, ...(raw.images || [])].filter(Boolean).length
      : 0;
    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft')  setImgIdx((i) => (i - 1 + (imgCount || 1)) % (imgCount || 1));
      if (e.key === 'ArrowRight') setImgIdx((i) => (i + 1) % (imgCount || 1));
      if (e.key === 'Escape')     setLightbox(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [raw]);

  useEffect(() => {
    setLoading(true);
    productApi
      .getById(id)
      .then((res) => {
        const p = res.product || res.data || res;
        setRaw(p);
        // pre-select first variant
        const firstVariant = p.variants?.[0];
        if (firstVariant) {
          setSelectedSize(firstVariant.size || '');
          setSelectedColor(firstVariant.color || '');
        }
      })
      .catch(() => setRaw(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#c9a96e]" />
      </div>
    );
  }

  if (!raw) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package size={56} className="text-gray-200" />
        <p className="text-gray-500 font-medium">Product not found.</p>
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-[#c9a96e] hover:underline">
          ← Go Back
        </button>
      </div>
    );
  }

  const product = normalizeProduct(raw);
  const wishlisted = isWishlisted(product._id);

  // Build full image list from mainImage + gallery
  const allImages = [
    ...(raw.mainImage ? [resolveImg(raw.mainImage)] : []),
    ...(raw.images || []).map(resolveImg),
  ].filter(Boolean);

  // Unique sizes and colors from variants
  const sizes = [...new Set((raw.variants || []).map((v) => v.size).filter(Boolean))];
  const variantColors = [...new Set((raw.variants || []).map((v) => v.color).filter(Boolean))];

  // Active variant for price
  const activeVariant =
    raw.variants?.find((v) => v.size === selectedSize && v.color === selectedColor) ||
    raw.variants?.find((v) => v.size === selectedSize) ||
    raw.variants?.[0];

  const basePrice = activeVariant?.price ?? 0;
  const discount = activeVariant?.discount ?? 0;
  const displayPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100)) : basePrice;
  const stockLeft = activeVariant?.stock ?? 0;

  const handleAdd = () => {
    if (!selectedSize && sizes.length > 0) {
      toast.error('Please select a size');
      return;
    }
    addToCart({ ...product, selectedSize, selectedColor }, selectedSize, quantity);
    toast.success(`${product.name} added to bag!`, {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
      iconTheme: { primary: '#c9a96e', secondary: '#fff' },
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied to clipboard!', {
      style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
    });
  };

  return (
  <>
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          {product.categoryName && (
            <>
              <span className="text-gray-500 capitalize">{product.categoryName}</span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* ── Image Gallery ── */}
          <div className="space-y-3">
            {/* Main image — portrait ratio, object-contain so nothing is cropped */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 group">
              <div className="aspect-[3/4] w-full flex items-center justify-center">
                {allImages.length > 0 ? (
                  <>
                    <motion.img
                      key={imgIdx}
                      src={allImages[imgIdx]}
                      alt={product.name}
                      className="w-full h-full object-contain cursor-zoom-in"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.22 }}
                      onClick={() => setLightbox(true)}
                    />
                    {/* Zoom hint */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-black/60 text-white rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] font-medium">
                        <ZoomIn size={12} /> Click to zoom
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <Package size={80} />
                  </div>
                )}
              </div>

              {/* Prev / Next arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors z-10"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors z-10"
                  >
                    <ChevronRight size={18} />
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`rounded-full transition-all ${i === imgIdx ? 'w-5 h-1.5 bg-gray-900' : 'w-1.5 h-1.5 bg-gray-400'}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {discount > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 bg-rose-500 text-white rounded-full shadow">-{discount}% OFF</span>
                )}
                {raw.isFeatured && (
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-500 text-white rounded-full shadow">★ Featured</span>
                )}
              </div>
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-all bg-white ${
                      i === imgIdx
                        ? 'border-gray-900 shadow-sm'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">
            {/* Brand / Category */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {product.brandName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  <Tag size={10} /> {product.brandName}
                </span>
              )}
              {product.categoryName && (
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Layers size={10} /> {product.categoryName}
                </span>
              )}
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {product.name}
            </h1>

            {/* Type tags */}
            {raw.type?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {raw.type.map((t) => (
                  <span key={t} className="text-[11px] font-bold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full capitalize">{t}</span>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-black text-gray-900">{formatPrice(displayPrice)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(basePrice)}</span>
                  <span className="text-sm font-black text-white bg-rose-500 px-2.5 py-0.5 rounded-full">-{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Stock badge */}
            <div className="mb-5">
              {stockLeft > 0 ? (
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                  stockLeft <= 5
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  <CheckCircle2 size={12} />
                  {stockLeft <= 5 ? `Only ${stockLeft} left!` : `${stockLeft} in stock`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                  <X size={12} /> Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            {raw.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{raw.description}</p>
            )}

            <div className="h-px bg-gray-100 mb-6" />

            {/* Color — swatch dots */}
            {variantColors.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-3">
                  Color — <span className="text-gray-800 font-bold normal-case tracking-normal text-xs">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variantColors.map((c) => {
                    const hex = getColorHex(c);
                    const isSelected = selectedColor === c;
                    return hex ? (
                      <button
                        key={c}
                        title={c}
                        onClick={() => setSelectedColor(c)}
                        className={`relative w-8 h-8 rounded-full transition-all ${
                          isSelected ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-110'
                        }`}
                        style={{
                          backgroundColor: hex,
                          border: hex === '#f8f8f8' || hex === '#fdf8ee' || hex === '#fffff0' ? '1.5px solid #d0d0d0' : 'none',
                        }}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke={hex === '#f8f8f8' || hex === '#fdf8ee' ? '#1a1a1a' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        )}
                      </button>
                    ) : (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[3rem] h-11 px-3 rounded-xl text-sm font-bold border-2 transition-all ${
                        selectedSize === s
                          ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-7">
              <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-3">Quantity</p>
              <div className="inline-flex items-center gap-0 border-2 border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-light text-gray-600"
                >−</button>
                <span className="w-12 text-center font-black text-base border-x-2 border-gray-200 h-11 flex items-center justify-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(q + 1, stockLeft || 99))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-light text-gray-600"
                >+</button>
              </div>
            </div>

            {/* CTA buttons — hidden on mobile (sticky bar handles it) */}
            <div className="hidden sm:flex gap-3">
              <button
                onClick={handleAdd}
                disabled={stockLeft === 0}
                className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-amber-200"
              >
                <ShoppingBag size={18} />
                {stockLeft === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  wishlisted ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-rose-300'
                }`}
              >
                <Heart size={20} className={wishlisted ? 'fill-rose-400 text-rose-400' : 'text-gray-400'} />
              </button>
              <button
                onClick={handleShare}
                className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-all text-gray-400 hover:text-gray-700"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Variants — collapsible accordion */}
            {raw.variants?.length > 0 && (
              <VariantsAccordion
                variants={raw.variants}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSelect={(color, size) => { setSelectedColor(color); setSelectedSize(size); }}
                formatPrice={formatPrice}
              />
            )}
          </div>
        </div>
      </div>
    </main>

    {/* ── Mobile Sticky CTA ── */}
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-2xl px-4 py-3 flex gap-3">
      <button
        onClick={() => toggleWishlist(product)}
        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
          wishlisted ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
        }`}
      >
        <Heart size={18} className={wishlisted ? 'fill-rose-400 text-rose-400' : 'text-gray-400'} />
      </button>
      <button
        onClick={handleAdd}
        disabled={stockLeft === 0}
        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-50 transition-colors"
      >
        <ShoppingBag size={16} />
        {stockLeft === 0 ? 'Out of Stock' : `Add to Bag — ${formatPrice(displayPrice)}`}
      </button>
    </div>
    {/* Bottom spacer for mobile sticky bar */}
    <div className="sm:hidden h-20" />

    {/* ── Lightbox ── */}
    <AnimatePresence>
      {lightbox && allImages.length > 0 && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-xs font-medium z-10">
              {imgIdx + 1} / {allImages.length}
            </div>
          )}

          {/* Image */}
          <motion.img
            key={imgIdx}
            src={allImages[imgIdx]}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain select-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + allImages.length) % allImages.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % allImages.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div
              className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`shrink-0 w-14 h-16 rounded-lg overflow-hidden border-2 transition-all bg-white/5 ${
                    i === imgIdx ? 'border-white' : 'border-white/20 hover:border-white/50'
                  }`}
                >
                  <img src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}

