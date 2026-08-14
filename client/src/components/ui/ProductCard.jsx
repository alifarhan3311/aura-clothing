import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, PackageX, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const formatPrice = (price) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(price);

// Color name → CSS hex mapping
const COLOR_MAP = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  black: '#1a1a1a', white: '#f8f8f8', gray: '#9ca3af', grey: '#9ca3af',
  pink: '#ec4899', purple: '#a855f7', orange: '#f97316', brown: '#92400e',
  navy: '#1e3a5f', maroon: '#7f1d1d', beige: '#d4b483', cream: '#fdf8ee',
  teal: '#14b8a6', cyan: '#06b6d4', gold: '#c9a96e', silver: '#94a3b8',
  olive: '#65a30d', mint: '#6ee7b7', lavender: '#c4b5fd', coral: '#fb7185',
  khaki: '#a3864b', rust: '#c2410c', rose: '#f43f5e', indigo: '#6366f1',
  violet: '#8b5cf6', lime: '#84cc16', amber: '#f59e0b', emerald: '#10b981',
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

// Normalise a raw backend product into a consistent shape
export function normalizeProduct(p) {
  if (!p) return null;
  const variant = p.variants?.[0] || {};
  const price = variant.price ?? p.price ?? 0;
  const discount = variant.discount ?? 0;
  const salePrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : null;
  const sizes = p.variants
    ? [...new Set(p.variants.map((v) => v.size).filter(Boolean))]
    : (p.sizes || []);
  const colors = p.colors?.length
    ? p.colors
    : p.variants
    ? [...new Set(p.variants.map((v) => v.color).filter(Boolean))]
    : [];

  return {
    ...p,
    _id: p._id || p.id,
    image: resolveImg(p.mainImage || p.image),
    images: [
      ...(p.mainImage ? [resolveImg(p.mainImage)] : []),
      ...(p.images || []).map(resolveImg),
    ].filter(Boolean),
    price,
    salePrice,
    onSale: salePrice !== null,
    discount,
    sizes,
    colors,
    brandName: typeof p.brand === 'object' ? p.brand?.name : (p.brandName || ''),
    categoryName: typeof p.category === 'object' ? p.category?.name : (p.categoryName || ''),
  };
}

export default function ProductCard({ product: rawProduct, onQuickView }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [hovered, setHovered] = useState(false);

  const product = normalizeProduct(rawProduct);
  if (!product) return null;

  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0] || 'Free Size', 1);
    toast.success(`${product.name} added to bag!`, {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', borderRadius: '10px', background: '#1a1a1a', color: '#fff' },
      iconTheme: { primary: '#c9a96e', secondary: '#fff' },
    });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
    toast(wishlisted ? 'Removed from wishlist' : '♡ Added to wishlist', {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', borderRadius: '10px', background: wishlisted ? '#6b6b6b' : '#e8a598', color: '#fff' },
    });
  };

  const handleClick = () => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      navigate(`/product/${product._id}`);
    }
  };

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: hovered
          ? '0 16px 48px rgba(0,0,0,0.13)'
          : '0 1px 6px rgba(0,0,0,0.07)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.26, ease: 'easeOut' }}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <PackageX size={40} />
          </div>
        )}

        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/10 transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        {/* ── Badges ── */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.onSale && (
            <span className="text-[10px] font-black px-2.5 py-1 bg-rose-500 text-white rounded-full shadow-sm">
              -{product.discount}% OFF
            </span>
          )}
          {product.isFeatured && !product.onSale && (
            <span className="text-[10px] font-black px-2.5 py-1 bg-amber-500 text-white rounded-full shadow-sm flex items-center gap-1">
              <Sparkles size={8} /> Featured
            </span>
          )}
        </div>

        {/* ── Wishlist ── */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="Toggle wishlist"
        >
          <Heart
            size={15}
            className={`transition-colors ${wishlisted ? 'fill-rose-400 text-rose-400' : 'text-gray-400'}`}
          />
        </button>

        {/* ── Hover Actions ── */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-all duration-300"
          style={{
            transform: hovered ? 'translateY(0)' : 'translateY(110%)',
            opacity: hovered ? 1 : 0,
          }}
        >
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-900 hover:text-white transition-colors duration-200 shadow-sm"
          >
            <ShoppingBag size={13} /> Quick Add
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors duration-200 shadow-sm"
            aria-label="View details"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-4">
        {/* Brand / Category */}
        <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase mb-1 truncate">
          {product.brandName || product.categoryName}
        </p>

        {/* Name */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-2.5 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>

        {/* ── Color swatches ── */}
        {product.colors?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mb-2.5">
            {product.colors.slice(0, 6).map((c) => {
              const hex = getColorHex(c);
              return hex ? (
                <span
                  key={c}
                  title={c}
                  className="w-4 h-4 rounded-full shadow-sm border inline-block"
                  style={{
                    backgroundColor: hex,
                    borderColor: hex === '#f8f8f8' || hex === '#fdf8ee' ? '#d0d0d0' : 'transparent',
                  }}
                />
              ) : (
                <span
                  key={c}
                  className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium"
                >
                  {c}
                </span>
              );
            })}
            {product.colors.length > 6 && (
              <span className="text-[9px] text-gray-400">+{product.colors.length - 6}</span>
            )}
          </div>
        )}

        {/* ── Price ── */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-gray-900">
            {formatPrice(product.salePrice ?? product.price)}
          </span>
          {product.onSale && (
            <>
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
              <span className="text-[10px] font-black text-rose-500">-{product.discount}%</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
