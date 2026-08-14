import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { departmentApi } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const DEFAULT_DEPARMENTS = [
  {
    _id: 'd1',
    name: 'Women',
    slug: 'women',
    subtitle: 'Elegant & Effortless',
    icon: '👗',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
  },
  {
    _id: 'd2',
    name: 'Men',
    slug: 'men',
    subtitle: 'Sharp & Refined',
    icon: '👔',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
  },
  {
    _id: 'd3',
    name: 'Kids',
    slug: 'kids',
    subtitle: 'Playful & Comfortable',
    icon: '👦',
    image: 'https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=800&q=80',
  },
  {
    _id: 'd4',
    name: 'Babies',
    slug: 'babies',
    subtitle: 'Cute & Soft',
    icon: '👶',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Categories() {
  const [departments, setDepartments] = useState(DEFAULT_DEPARMENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentApi
      .getAll()
      .then((res) => {
        if (res.departments && res.departments.length > 0) {
          setDepartments(res.departments);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 lg:py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center mb-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 text-[11px] font-black px-3.5 py-1.5 rounded-full border border-amber-200/80 shadow-xs">
              <Sparkles size={11} /> Find Your Style
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-950 tracking-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Shop by Department
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-md mx-auto">
            Explore our curated collections crafted for every member of the family
          </p>
        </div>

        {/* Dynamic Round Circle Cards Grid */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-8 sm:gap-10 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {departments.map((dept) => (
            <motion.div key={dept._id || dept.slug} variants={cardVariants}>
              <Link
                to={`/shop?section=${dept.slug}`}
                className="group flex flex-col items-center text-center transition-all duration-300"
              >
                {/* Round Circle Avatar with Hover Effect */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full p-1.5 bg-white border-2 border-gray-200 group-hover:border-[#c9a96e] transition-all duration-300 shadow-md group-hover:shadow-2xl group-hover:shadow-[#c9a96e]/20 group-hover:-translate-y-2">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                    {dept.image ? (
                      <img
                        src={resolveImg(dept.image)}
                        alt={dept.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-amber-50">
                        {dept.icon || '✨'}
                      </div>
                    )}
                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Emoji Badge on bottom right of circle */}
                  <span className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white border border-gray-100 shadow-md flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    {dept.icon || '✨'}
                  </span>
                </div>

                {/* Text below circle */}
                <div className="mt-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-amber-800 transition-colors flex items-center justify-center gap-1">
                    {dept.name}
                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-amber-700" />
                  </h3>
                  {dept.subtitle && (
                    <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-[150px] truncate">
                      {dept.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
