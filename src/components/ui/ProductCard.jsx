import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

const badgeColors = {
  Sale: 'bg-rose-400 text-white',
  New: 'bg-emerald-500 text-white',
  Trending: 'bg-amber-500 text-white',
};

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const displayPrice = product.onSale ? product.salePrice : product.price;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0];
    addToCart(product, defaultSize, 1);
    toast.success(`${product.name} added to bag!`, {
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        borderRadius: '8px',
        background: '#1a1a1a',
        color: '#fff',
      },
      iconTheme: { primary: '#c9a96e', secondary: '#fff' },
    });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♡', {
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        borderRadius: '8px',
        background: wishlisted ? '#6b6b6b' : '#e8a598',
        color: '#fff',
      },
    });
  };

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView && onQuickView(product)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
          loading="lazy"
        />

        {/* Overlay actions */}
        <div
          className="absolute inset-0 bg-black/5 transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide ${badgeColors[product.badge] || 'bg-gray-800 text-white'}`}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110"
          aria-label="Add to wishlist"
        >
          <Heart
            size={16}
            className={wishlisted ? 'fill-rose-400 text-rose-400' : 'text-gray-500'}
          />
        </button>

        {/* Bottom action bar */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-all duration-300"
          style={{
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            opacity: isHovered ? 1 : 0,
          }}
        >
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-900 hover:text-white transition-colors duration-200"
          >
            <ShoppingBag size={13} />
            Quick Add
          </button>
          {onQuickView && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors duration-200"
              aria-label="Quick view"
            >
              <Eye size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-1">
          {product.subcategory}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-2 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(displayPrice)}
          </span>
          {product.onSale && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
          {product.onSale && (
            <span className="text-xs font-semibold text-rose-500">
              -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
