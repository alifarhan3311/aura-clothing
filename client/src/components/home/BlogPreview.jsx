import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';

const posts = [
  {
    id: 1,
    category: 'Style Guide',
    title: 'How to Build a Capsule Wardrobe That Works Year Round',
    excerpt: 'Discover the essential pieces that form the foundation of a timeless, versatile wardrobe — no more outfit stress.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    readTime: '5 min read',
    date: 'Aug 8, 2025',
  },
  {
    id: 2,
    category: 'Trends',
    title: 'The Colors Dominating Fashion This Summer',
    excerpt: 'From buttery yellows to earthy terracottas — the palette of the season and how to wear it effortlessly.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
    readTime: '4 min read',
    date: 'Aug 5, 2025',
  },
  {
    id: 3,
    category: 'Sustainability',
    title: 'Our Commitment to Conscious Fashion',
    excerpt: "At MH Clothing, we believe style shouldn't come at the planet's expense. Here's how we're changing the industry.",
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
    readTime: '6 min read',
    date: 'Jul 29, 2025',
  },
];

export default function BlogPreview() {
  return (
    <section className="py-20 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-2">The MH Clothing Journal</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Style Stories
            </h2>
          </div>
          <a href="#" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-amber-700 transition-colors group">
            All Articles <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden cursor-pointer"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="relative overflow-hidden aspect-[16/10]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-amber-700">
                  {post.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Clock size={11} />
                  <span>{post.readTime}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:gap-2 transition-all">
                  Read More <ArrowRight size={12} />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
