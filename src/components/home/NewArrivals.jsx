import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import ProductModal from '../ui/ProductModal';
import { getNewArrivals } from '../../data/products';

export default function NewArrivals() {
  const products = getNewArrivals();
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <section className="py-20 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <ProductCard product={product} onQuickView={setSelectedProduct} />
            </motion.div>
          ))}
        </div>

        <div className="sm:hidden text-center mt-8">
          <Link to="/women" className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-full text-sm font-semibold">
            View All New Arrivals <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
  );
}
