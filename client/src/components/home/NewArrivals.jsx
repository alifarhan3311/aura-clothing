import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { productApi } from '../../lib/api';

function SkeletonCard() {
  return (
    <div className="animate-pulse shrink-0 w-48 sm:w-56">
      <div className="bg-gray-100 rounded-2xl aspect-[3/4] mb-3" />
      <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .getNewArrivals(8)
      .then((res) => {
        const data = res.products || res.data || res;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-2">Fresh Drops</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              New Arrivals
            </h2>
          </div>
          <Link
            to="/women"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-amber-700 transition-colors group"
          >
            View All <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="shrink-0 w-48 sm:w-56 snap-start"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">No new arrivals yet.</div>
        )}

        <div className="sm:hidden text-center mt-6">
          <Link to="/women" className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-full text-sm font-semibold">
            View All New Arrivals <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
