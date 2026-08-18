import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { slideApi } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const DEFAULT_SLIDE = {
  _id: 'default-1',
  eyebrow: 'New Season — Summer 2025',
  title: 'Dress in Your Fade Find',
  subtitle: 'Discover effortless style crafted with premium fabrics. From everyday elegance to standout moments — wear your story.',
  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85',
  buttonText: 'Shop All Products',
  linkPath: '/shop',
  secondaryButtonText: 'About Us',
  secondaryLinkPath: '/about',
  badgeText: 'New Collection',
};

export default function Hero() {
  const [slides, setSlides] = useState([DEFAULT_SLIDE]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayTimer = useRef(null);

  useEffect(() => {
    slideApi
      .getActive()
      .then((res) => {
        if (res.slides && res.slides.length > 0) {
          setSlides(res.slides);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-play timer (5 seconds)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    autoPlayTimer.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(autoPlayTimer.current);
  }, [slides, isHovered]);

  const currentSlide = slides[currentIndex] || DEFAULT_SLIDE;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const renderLinkButton = (text, path, isPrimary = true) => {
    if (!text || !path) return null;

    const isExternal = path.startsWith('http://') || path.startsWith('https://');

    const baseClass = isPrimary
      ? 'group inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3.5 rounded-full text-sm font-black hover:bg-amber-700 transition-all duration-300 shadow-xl hover:shadow-amber-200/50'
      : 'inline-flex items-center gap-2 border-2 border-gray-900 bg-white/90 backdrop-blur-xs text-gray-900 px-7 py-3.5 rounded-full text-sm font-black hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm';

    if (isExternal) {
      return (
        <a href={path} target="_blank" rel="noopener noreferrer" className={baseClass}>
          {text}
          {isPrimary && <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />}
        </a>
      );
    }

    return (
      <Link to={path} className={baseClass}>
        {text}
        {isPrimary && <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />}
      </Link>
    );
  };

  return (
    <section
      className="relative min-h-[90vh] lg:min-h-[92vh] flex items-center overflow-hidden bg-[#faf8f5]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image slider (Desktop / Tablet only) — Full crisp image on right, clean fade on left */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide._id || currentIndex}
          className="absolute inset-0 hidden md:block"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Main crisp image */}
          <img
            src={resolveImg(currentSlide.image)}
            alt={currentSlide.title}
            className="w-full h-full object-cover object-right sm:object-right-top"
          />

          {/* Left gradient overlay to make left text 100% readable without obscuring right actor */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5] via-[#faf8f5]/85 to-transparent w-full md:w-[65%]" />
        </motion.div>
      </AnimatePresence>

      {/* Mobile Ambient Glow & Shading (Active only on mobile screens when image is hidden) */}
      <div className="absolute inset-0 md:hidden pointer-events-none overflow-hidden">
        {/* Soft luxury glow orbs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-gradient-to-br from-amber-200/60 via-amber-100/40 to-rose-100/30 blur-3xl opacity-80" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-amber-200/50 via-orange-100/40 to-transparent blur-2xl opacity-70" />
        <div className="absolute -bottom-10 right-2 w-80 h-80 rounded-full bg-gradient-to-tl from-stone-200/60 via-amber-100/40 to-transparent blur-3xl opacity-80" />
        
        {/* Radial ambient shading */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-900/[0.03]" />
      </div>

      {/* Main Slide Content */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 w-full py-16 sm:py-20 lg:py-24 z-10">
        <div className="max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide._id || currentIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* Eyebrow / Tag */}
              {(currentSlide.eyebrow || currentSlide.badgeText) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {currentSlide.eyebrow && (
                    <span className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-900 text-[11px] font-black px-3.5 py-1.5 rounded-full border border-amber-200/80 shadow-xs">
                      <Sparkles size={11} /> {currentSlide.eyebrow}
                    </span>
                  )}
                  {currentSlide.badgeText && (
                    <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-xs">
                      {currentSlide.badgeText}
                    </span>
                  )}
                </div>
              )}

              {/* Main Heading */}
              <h1
                className="text-4xl sm:text-6xl lg:text-[5.2rem] font-bold text-gray-950 leading-[1.04] mb-5 tracking-tight drop-shadow-xs"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {currentSlide.title}
              </h1>

              {/* Subtitle / Description */}
              {currentSlide.subtitle && (
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 max-w-md font-medium">
                  {currentSlide.subtitle}
                </p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                {renderLinkButton(currentSlide.buttonText || 'Shop Now', currentSlide.linkPath || '/shop', true)}
                {renderLinkButton(currentSlide.secondaryButtonText, currentSlide.secondaryLinkPath, false)}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats row (Optional - controlled by Admin per slide) */}
          {currentSlide.showStats && (
            <motion.div
              key={`stats-${currentSlide._id || currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-8 mt-12 pt-6 border-t border-gray-900/10"
            >
              {[
                { value: currentSlide.stat1Value || '10K+', label: currentSlide.stat1Label || 'Happy Customers' },
                { value: currentSlide.stat2Value || '500+', label: currentSlide.stat2Label || 'Styles Available' },
                { value: currentSlide.stat3Value || '4.9★', label: currentSlide.stat3Label || 'Average Rating' },
              ]
                .filter(({ value, label }) => Boolean(value || label))
                .map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-xl font-black text-gray-950">{value}</p>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">{label}</p>
                  </div>
                ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Prev / Next controls (Desktop / Tablet) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs border border-gray-200 hidden sm:flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white transition-all z-20 shadow-lg"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs border border-gray-200 hidden sm:flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white transition-all z-20 shadow-lg"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-8 bg-gray-900' : 'w-2.5 bg-gray-400/70 hover:bg-gray-700'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 right-8 hidden sm:flex flex-col items-center gap-2 opacity-50 z-10"
        animate={{ y: [0, 7, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
      >
        <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-600 to-transparent" />
        <span className="text-[10px] tracking-[0.3em] font-bold uppercase text-gray-600">Scroll</span>
      </motion.div>
    </section>
  );
}
