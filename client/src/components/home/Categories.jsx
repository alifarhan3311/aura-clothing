import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function Categories() {
  const [departments, setDepartments] = useState(DEFAULT_DEPARMENTS);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const hasScroll = el.scrollWidth > el.clientWidth + 5;
    setCanScrollLeft(hasScroll && el.scrollLeft > 10);
    setCanScrollRight(hasScroll && el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [departments]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -380 : 380;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Center if 3 or fewer items on desktop, else scrollable
  const isCentered = departments.length <= 3;

  return (
    <section className="py-20 lg:py-24 bg-[#faf8f5] overflow-hidden">
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
      </div>

      {/* Horizontal Scroll / Centered Strip */}
      <div className="relative max-w-7xl mx-auto">
        {/* Left Fade */}
        <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#faf8f5] to-transparent z-10 transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        {/* Right Fade */}
        <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#faf8f5] to-transparent z-10 transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-[#c9a96e] hover:text-white hover:border-[#c9a96e] transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-[#c9a96e] hover:text-white hover:border-[#c9a96e] transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Scrollable / Centered Row */}
        <div
          ref={scrollRef}
          className={`flex items-center gap-6 sm:gap-8 px-6 sm:px-12 pb-6 overflow-x-auto scrollbar-none scroll-smooth ${
            isCentered ? 'justify-start md:justify-center' : 'justify-start'
          }`}
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {departments.map((dept, index) => (
            <motion.div
              key={dept._id || dept.slug}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.06 }}
              style={{ scrollSnapAlign: 'center' }}
              className="shrink-0"
            >
              <Link
                to={`/shop?section=${dept.slug}`}
                className="group flex flex-col items-center text-center transition-all duration-300"
              >
                {/* Large Responsive Department Card */}
                <div className="relative w-64 h-72 sm:w-72 sm:h-80 lg:w-80 lg:h-96 rounded-3xl overflow-hidden border-2 border-gray-200 group-hover:border-[#c9a96e] transition-all duration-300 shadow-md group-hover:shadow-2xl group-hover:shadow-[#c9a96e]/25 group-hover:-translate-y-2 bg-gray-100">
                  {dept.image ? (
                    <img
                      src={resolveImg(dept.image)}
                      alt={dept.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl bg-amber-50">
                      {dept.icon || '✨'}
                    </div>
                  )}

                  {/* Dark overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />

                  {/* Bottom Info Card */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left flex items-end justify-between">
                    <div>
                      {dept.subtitle && (
                        <p className="text-amber-300 text-xs font-bold tracking-wider uppercase mb-1">
                          {dept.subtitle}
                        </p>
                      )}
                      <h3 className="text-white font-black text-2xl sm:text-3xl leading-tight flex items-center gap-2">
                        {dept.name}
                      </h3>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#c9a96e] group-hover:border-[#c9a96e] transition-all duration-300 shrink-0">
                      <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
