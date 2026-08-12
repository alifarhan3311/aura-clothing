import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, ArrowRight } from 'lucide-react';

export default function SaleBanner() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-400 blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-rose-400 blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between p-10 md:p-14 gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide mb-4">
                <Tag size={12} />
                Limited Time Offer
              </div>
              <h2
                className="text-4xl sm:text-5xl font-bold mb-3 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Up to{' '}
                <span className="text-amber-400">50% Off</span>
                <br />
                Select Styles
              </h2>
              <p className="text-gray-400 text-base max-w-sm">
                Don't miss our seasonal clearance event. Premium pieces at unbeatable prices — for a limited time only.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              {/* Countdown visual */}
              <div className="grid grid-cols-3 gap-3 text-center mb-2">
                {[
                  { value: '02', label: 'Days' },
                  { value: '14', label: 'Hours' },
                  { value: '37', label: 'Mins' },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 min-w-[70px]">
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/women"
                className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm"
              >
                Shop the Sale
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
