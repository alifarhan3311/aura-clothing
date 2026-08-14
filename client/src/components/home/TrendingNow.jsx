import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { productApi } from '../../lib/api';

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

export default function TrendingNow() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .getTrending(8)
      .then((res) => {
        const data = res.products || res.data || res;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 text-[11px] font-black px-3 py-1.5 rounded-full border border-rose-100">
                <TrendingUp size={10} /> Most Loved
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Trending Now
            </h2>
            <p className="text-sm text-gray-400 mt-2">What everyone's wearing right now</p>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-amber-700 transition-colors group bg-gray-50 px-4 py-2.5 rounded-full border border-gray-200 hover:border-amber-200">
            Shop All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">No trending products at the moment.</div>
        )}
      </div>
    </section>
  );
}
