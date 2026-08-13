import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#f7f3ee]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85"
          alt="Fade Find Hero"
          className="w-full h-full object-cover object-top opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f3ee]/90 via-[#f7f3ee]/60 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-4"
          >
            New Season — Summer 2025
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.05] mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Dress in
            <br />
            <span className="italic text-amber-700">Your Fade Find</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base sm:text-lg text-gray-600 leading-relaxed mb-10 max-w-md"
          >
            Discover effortless style crafted with premium fabrics. From everyday elegance to standout moments — wear your story.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              to="/shop?section=women"
              className="group inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-amber-700 transition-colors duration-300"
            >
              Shop Women
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/shop?section=men"
              className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-900 hover:text-white transition-colors duration-300"
            >
              Shop Men
            </Link>
            <Link
              to="/shop?section=kids"
              className="inline-flex items-center gap-2 border border-gray-400 text-gray-600 px-7 py-3.5 rounded-full text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors duration-300"
            >
              Shop Kids
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center gap-8 mt-14"
          >
            {[
              { value: '10K+', label: 'Happy Customers' },
              { value: '500+', label: 'Styles Available' },
              { value: '4.9★', label: 'Average Rating' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-px h-10 bg-gray-400/50" />
        <span className="text-xs tracking-widest uppercase text-gray-400">Scroll</span>
      </motion.div>
    </section>
  );
}
