import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { productApi } from '../../lib/api';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-100 rounded-2xl aspect-[3/4] mb-3" />
      <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .getFeatured(6)
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
            <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-2">Editor's Picks</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Featured Styles
            </h2>
          </div>
          <Link to="/women" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-amber-700 transition-colors group">
            View All <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">No featured products yet.</div>
        )}
      </div>
    </section>
  );
}
