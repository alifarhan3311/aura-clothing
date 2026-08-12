import React, { useState } from 'react';
import { X, ShoppingBag, Heart, ChevronLeft, ChevronRight, Tag, Layers, Package, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';
import { normalizeProduct } from './ProductCard';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

export default function ProductModal({ product: rawProduct, onClose }) {
  const product = normalizeProduct(rawProduct);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();

  // All unique sizes from variants
  const sizes = product?.sizes || [];
  // All unique colors from variants
  const variantColors = product?.variants
    ? [...new Set(product.variants.map((v) => v.color).filter(Boolean))]
    : (product?.colors || []);

  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(variantColors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  if (!product) return null;

  const wishlisted = isWishlisted(product._id);

  // Recalculate price from selected variant
  const activeVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  ) || selectedVariant;

  const basePrice = activeVariant?.price ?? product.price ?? 0;
  const discount = activeVariant?.discount ?? product.discount ?? 0;
  const displayPrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100)) : basePrice;

  // All images: mainImage + gallery
  const allImages = product.images?.length ? product.images : (product.image ? [product.image] : []);

  const handleAdd = () => {
    addToCart(
      { ...product, selectedSize, selectedColor },
      selectedSize,
      quantity
    );
    toast.success(`${product.name} added to bag!`, {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
      iconTheme: { primary: '#c9a96e', secondary: '#fff' },
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative bg-white rounded-3xl overflow-hidden w-full max-w-3xl shadow-2xl z-10 max-h-[92vh] overflow-y-auto"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* ── Images ── */}
            <div className="relative bg-gray-50">
              <div className="aspect-square">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[imgIdx]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <Package size={64} />
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
                  >
                    <ChevronRight size={16} />
                  </button>
                  {/* Thumbnail dots */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-gray-900 w-4' : 'bg-gray-400'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── Details ── */}
            <div className="p-6 sm:p-8 flex flex-col">
              {/* Brand / Category */}
              <div className="flex items-center gap-3 mb-2">
                {product.brandName && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                    <Tag size={10} /> {product.brandName}
                  </span>
                )}
                {product.categoryName && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Layers size={10} /> {product.categoryName}
                  </span>
                )}
              </div>

              <h2
                className="text-2xl font-bold text-gray-900 mb-1 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {product.name}
              </h2>

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.isFeatured && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">★ Featured</span>
                )}
                {product.type?.map((t) => (
                  <span key={t} className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full capitalize">{t}</span>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-base text-gray-400 line-through">{formatPrice(basePrice)}</span>
                    <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">-{discount}% OFF</span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3">{product.description}</p>
              )}

              {/* Color selector */}
              {variantColors.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
                    Color — <span className="text-gray-900 font-semibold normal-case tracking-normal">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variantColors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
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

              {/* Size selector */}
              {sizes.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          selectedSize === size
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Quantity</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-lg font-medium">−</button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-lg font-medium">+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-gray-900 text-white py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#c9a96e] transition-colors"
                >
                  <ShoppingBag size={16} /> Add to Bag
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${wishlisted ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <Heart size={18} className={wishlisted ? 'fill-rose-400 text-rose-400' : 'text-gray-500'} />
                </button>
              </div>

              {/* View full product page */}
              <button
                onClick={() => { onClose(); navigate(`/product/${product._id}`); }}
                className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-amber-700 transition-colors py-2"
              >
                View Full Details <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
