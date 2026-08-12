import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, Heart, ChevronLeft, ChevronRight,
  ArrowLeft, Tag, Layers, Package, Loader2, Share2, ZoomIn, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productApi } from '../lib/api';
import { normalizeProduct } from '../components/ui/ProductCard';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const formatPrice = (p) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(p);

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
            <div className="flex items-center gap-3 mb-3">
              {product.brandName && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 uppercase tracking-widest">
                  <Tag size={12} /> {product.brandName}
                </span>
              )}
              {product.categoryName && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Layers size={12} /> {product.categoryName}
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
              <div className="flex gap-2 mb-4">
                {raw.type.map((t) => (
                  <span key={t} className="text-[11px] font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full capitalize">{t}</span>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-black text-gray-900">{formatPrice(displayPrice)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(basePrice)}</span>
                  <span className="text-sm font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">-{discount}%</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mb-5">
              {stockLeft > 0 ? (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stockLeft <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {stockLeft <= 5 ? `Only ${stockLeft} left!` : `${stockLeft} in stock`}
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            {raw.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{raw.description}</p>
            )}

            <hr className="border-gray-100 mb-5" />

            {/* Color */}
            {variantColors.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2.5">
                  Color — <span className="text-gray-900 font-semibold normal-case tracking-normal">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variantColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        selectedColor === c
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2.5">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 rounded-xl text-sm font-semibold border-2 transition-all ${
                        selectedSize === s
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

            {/* Quantity */}
            <div className="mb-7">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2.5">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-xl font-light"
                >−</button>
                <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(q + 1, stockLeft || 99))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-xl font-light"
                >+</button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={stockLeft === 0}
                className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ShoppingBag size={18} />
                {stockLeft === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  wishlisted ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <Heart size={20} className={wishlisted ? 'fill-rose-400 text-rose-400' : 'text-gray-500'} />
              </button>
              <button
                onClick={handleShare}
                className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-all text-gray-500"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Colors list (product-level) */}
            {product.colors?.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Colors</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.map((c) => (
                    <span key={c} className="px-2.5 py-1 text-[11px] font-medium bg-[#f0e4cc]/60 text-amber-900 border border-[#c9a96e]/30 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Variants table */}
            {raw.variants?.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">All Variants</p>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-2.5">Color</th>
                        <th className="p-2.5">Size</th>
                        <th className="p-2.5">Price</th>
                        <th className="p-2.5">Discount</th>
                        <th className="p-2.5">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {raw.variants.map((v, i) => (
                        <tr
                          key={v._id || i}
                          onClick={() => { setSelectedColor(v.color); setSelectedSize(v.size); }}
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedSize === v.size && selectedColor === v.color ? 'bg-[#f0e4cc]/40' : ''
                          }`}
                        >
                          <td className="p-2.5 font-medium text-gray-900">{v.color}</td>
                          <td className="p-2.5">{v.size}</td>
                          <td className="p-2.5 font-semibold">{formatPrice(v.price)}</td>
                          <td className="p-2.5 text-amber-700">{v.discount}%</td>
                          <td className={`p-2.5 font-bold ${v.stock > 5 ? 'text-emerald-600' : v.stock > 0 ? 'text-amber-600' : 'text-rose-500'}`}>
                            {v.stock} pcs
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>

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

