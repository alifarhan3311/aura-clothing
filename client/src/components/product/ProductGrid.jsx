import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import ProductModal from '../ui/ProductModal';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Most Popular', value: 'popular' },
];

const PRICE_RANGES = [
  { label: 'Under Rs. 3,000', min: 0, max: 3000 },
  { label: 'Rs. 3,000 – 7,000', min: 3000, max: 7000 },
  { label: 'Rs. 7,000 – 15,000', min: 7000, max: 15000 },
  { label: 'Above Rs. 15,000', min: 15000, max: Infinity },
];

export default function ProductGrid({ products, title, subtitle }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSubcats, setSelectedSubcats] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showSaleOnly, setShowSaleOnly] = useState(false);

  // Derive filter options from products
  const subcategories = useMemo(() => [...new Set(products.map((p) => p.subcategory))], [products]);
  const allSizes = useMemo(() => [...new Set(products.flatMap((p) => p.sizes))], [products]);

  const toggleSubcat = (cat) =>
    setSelectedSubcats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const toggleSize = (size) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedSubcats.length > 0)
      result = result.filter((p) => selectedSubcats.includes(p.subcategory));

    if (selectedSizes.length > 0)
      result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));

    if (selectedPrice) {
      const range = PRICE_RANGES[selectedPrice];
      result = result.filter((p) => {
        const price = p.onSale ? p.salePrice : p.price;
        return price >= range.min && price < range.max;
      });
    }

    if (showSaleOnly) result = result.filter((p) => p.onSale);

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.onSale ? a.salePrice : a.price) - (b.onSale ? b.salePrice : b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.onSale ? b.salePrice : b.price) - (a.onSale ? a.salePrice : a.price));
        break;
      case 'popular':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, selectedSubcats, selectedSizes, selectedPrice, sortBy, showSaleOnly]);

  const activeFiltersCount =
    selectedSubcats.length + selectedSizes.length + (selectedPrice !== null ? 1 : 0) + (showSaleOnly ? 1 : 0);

  const clearFilters = () => {
    setSelectedSubcats([]);
    setSelectedSizes([]);
    setSelectedPrice(null);
    setShowSaleOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        {subtitle && (
          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-2">{subtitle}</p>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
          {title}
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X size={12} /> Clear all
            </button>
          )}

          <span className="text-sm text-gray-400">{filtered.length} results</span>
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-medium text-gray-700 bg-white outline-none hover:border-gray-400 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 bg-gray-50 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Category filter */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Category</h4>
            <div className="space-y-2">
              {subcategories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedSubcats.includes(cat)}
                    onChange={() => toggleSubcat(cat)}
                    className="w-4 h-4 rounded border-gray-300 accent-gray-900"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size filter */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Size</h4>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedSizes.includes(size)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Price Range</h4>
            <div className="space-y-2">
              {PRICE_RANGES.map((range, idx) => (
                <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPrice === idx}
                    onChange={() => setSelectedPrice(idx === selectedPrice ? null : idx)}
                    className="accent-gray-900"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sale toggle */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Offers</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSaleOnly}
                onChange={() => setShowSaleOnly((s) => !s)}
                className="w-4 h-4 rounded border-gray-300 accent-gray-900"
              />
              <span className="text-sm text-gray-600">On Sale Only</span>
            </label>
          </div>
        </motion.div>
      )}

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🛍️</p>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters or browse all items.</p>
          <button onClick={clearFilters} className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.4) }}
            >
              <ProductCard product={product} onQuickView={setSelectedProduct} />
            </motion.div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
