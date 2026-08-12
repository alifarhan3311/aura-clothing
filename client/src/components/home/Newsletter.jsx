import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Welcome to the MH Clothing family! 🎉', {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
      iconTheme: { primary: '#c9a96e', secondary: '#fff' },
    });
    setEmail('');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="text-amber-400" size={24} />
          </div>

          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-400 mb-3">Stay in the Loop</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Join the MH Clothing Circle
          </h2>
          <p className="text-gray-400 text-base mb-8 max-w-md mx-auto leading-relaxed">
            Subscribe to receive exclusive offers, early access to new drops, and style inspiration curated just for you.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-7 py-3.5 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
            >
              Subscribe <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-600">
            No spam, ever. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
