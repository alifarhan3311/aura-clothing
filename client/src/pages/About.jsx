import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Leaf, Star, Users } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Made with Love',
    desc: 'Every piece is crafted with attention to detail, ensuring premium quality that you can feel in every stitch.',
  },
  {
    icon: Leaf,
    title: 'Sustainably Minded',
    desc: 'We are committed to responsible fashion — sourcing ethical fabrics and reducing our environmental footprint.',
  },
  {
    icon: Star,
    title: 'Uncompromising Quality',
    desc: 'From fabric selection to finishing, we maintain the highest standards so your clothes stand the test of time.',
  },
  {
    icon: Users,
    title: 'Community First',
    desc: 'Built on real relationships with our customers, artisans, and the communities where our clothes are made.',
  },
];

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-80 sm:h-96 flex items-center overflow-hidden bg-[#f7f3ee]">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
          alt="About Fade Find"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-3"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            About Fade Find
          </motion.h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-4">Where We Began</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
                Redefining Fashion for the Modern Pakistani Woman & Man
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Fade Find was born in Lahore in 2019 with a simple but bold belief: that premium fashion should be accessible, thoughtful, and deeply rooted in who you are. We started as a small atelier with a handful of styles and a clear vision — to create clothing that makes people feel extraordinary in the everyday.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we serve thousands of customers across Pakistan, offering curated collections for Women, Men, and Kids that blend contemporary silhouettes with timeless elegance. Every piece in our collection is designed with intention — chosen for its quality, versatility, and ability to make you feel like the best version of yourself.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-3"
            >
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" alt="Fade Find story" className="rounded-2xl object-cover aspect-[4/5] w-full" />
              <img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80" alt="Fade Find story" className="rounded-2xl object-cover aspect-[4/5] w-full mt-8" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-3">What We Stand For</p>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 text-center"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <val.icon size={22} className="text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
