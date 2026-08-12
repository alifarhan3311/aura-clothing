import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, PackageX } from 'lucide-react';
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

// Normalise a raw backend product into a consistent shape
export function normalizeProduct(p) {
  if (!p) return null;
  const variant = p.variants?.[0] || {};
  const price = variant.price ?? p.price ?? 0;
  const discount = variant.discount ?? 0;
  const salePrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : null;
  const sizes = p.variants ? [...new Set(p.variants.map((v) => v.size).filter(Boolean))] : (p.sizes || []);
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
  const [isHovered, setIsHovered] = useState(false);

  const product = normalizeProduct(rawProduct);
  if (!product) return null;

  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0] || 'Free Size', 1);
    toast.success(`${product.name} added to bag!`, {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
      iconTheme: { primary: '#c9a96e', secondary: '#fff' },
    });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♡', {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: wishlisted ? '#6b6b6b' : '#e8a598', color: '#fff' },
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
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
            style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <PackageX size={40} />
          </div>
        )}

        <div className="absolute inset-0 bg-black/5 transition-opacity duration-300" style={{ opacity: isHovered ? 1 : 0 }} />

        {/* Badges */}
        {product.onSale && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 bg-rose-500 text-white rounded-full">
            -{product.discount}%
          </span>
        )}
        {product.isFeatured && !product.onSale && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">
            ★ Featured
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={wishlisted ? 'fill-rose-400 text-rose-400' : 'text-gray-500'} />
        </button>

        {/* Hover actions */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-all duration-300"
          style={{ transform: isHovered ? 'translateY(0)' : 'translateY(100%)', opacity: isHovered ? 1 : 0 }}
        >
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-900 hover:text-white transition-colors duration-200"
          >
            <ShoppingBag size={13} /> Quick Add
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors duration-200"
            aria-label="View details"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-1">
          {product.brandName || product.categoryName}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-2 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>

        {/* Colors preview */}
        {product.colors?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">{c}</span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(product.salePrice ?? product.price)}
          </span>
          {product.onSale && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
          {product.onSale && (
            <span className="text-xs font-semibold text-rose-500">-{product.discount}%</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
