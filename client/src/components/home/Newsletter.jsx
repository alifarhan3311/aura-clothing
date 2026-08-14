import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Sparkles, Gift, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Welcome to the Fade Find family! 🎉', {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
      iconTheme: { primary: '#c9a96e', secondary: '#fff' },
    });
    setEmail('');
  };

  return (
    <section className="py-24 relative overflow-hidden bg-gray-950">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-rose-500/8 blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          {/* Icon */}
          <div className="inline-flex w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/20 items-center justify-center mb-6">
            <Mail className="text-amber-400" size={26} />
          </div>

          <p className="text-[11px] font-black tracking-[0.4em] uppercase text-amber-400 mb-3">
            Stay in the Loop
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Join the{' '}
            <em className="text-amber-400 not-italic">Fade Find</em> Circle
          </h2>
          <p className="text-gray-500 text-base mb-8 max-w-md mx-auto leading-relaxed">
            Subscribe to receive exclusive offers, early access to new drops, and style inspiration curated just for you.
          </p>

          {/* Benefits row */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-gray-500 text-xs">
            {[
              { icon: Gift, text: '10% off your first order' },
              { icon: Zap, text: 'Early access to sales' },
              { icon: Sparkles, text: 'Exclusive style guides' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 bg-white/5 border border-white/8 px-3 py-1.5 rounded-full">
                <Icon size={11} className="text-amber-500" /> {text}
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-white/8 backdrop-blur-sm border border-white/15 rounded-full px-5 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-7 py-3.5 rounded-full text-sm font-black transition-all duration-200 whitespace-nowrap hover:shadow-lg hover:shadow-amber-500/25"
            >
              Subscribe <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-700">
            No spam, ever. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
