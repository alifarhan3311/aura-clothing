import React from 'react';
import ProductGrid from '../components/product/ProductGrid';
import { getProductsByCategory } from '../data/products';
import Newsletter from '../components/home/Newsletter';

export default function Kids() {
  const products = getProductsByCategory('kids');
  return (
    <main>
      <div
        className="relative h-56 sm:h-72 flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #fdf0ed 0%, #fff8f0 100%)' }}
      >
        <img
          src="https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=1600&q=70"
          alt="Kids' Collection"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-25"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-2">Little Ones</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Kids' Edit
          </h1>
          <p className="text-gray-600 mt-2 text-sm">{products.length} styles available</p>
        </div>
      </div>

      <ProductGrid products={products} title="Kids' Collection" />
      <Newsletter />
    </main>
  );
}
