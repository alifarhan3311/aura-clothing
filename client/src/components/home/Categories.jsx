import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

  const categories = [
  {
    label: 'Women',
    to: '/shop?section=women',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    subtitle: 'Elegant & Effortless',
    color: '#f0e4cc',
  },
  {
    label: 'Men',
    to: '/shop?section=men',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    subtitle: 'Sharp & Refined',
    color: '#e8eef5',
  },
  {
    label: 'Kids',
    to: '/shop?section=kids',
    image: 'https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=800&q=80',
    subtitle: 'Playful & Comfortable',
    color: '#fdf0ed',
  },
  ];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function Categories() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-3">
            Shop by Category
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Find Your Style
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {categories.map((cat) => (
            <motion.div key={cat.label} variants={cardVariants}>
              <Link to={cat.to} className="group block relative overflow-hidden rounded-3xl aspect-[3/4]">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="text-xs text-white/70 font-medium tracking-widest uppercase mb-1">
                    {cat.subtitle}
                  </p>
                  <h3 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {cat.label}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/30 group-hover:bg-white group-hover:text-gray-900 transition-all duration-300">
                    Shop Now <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
