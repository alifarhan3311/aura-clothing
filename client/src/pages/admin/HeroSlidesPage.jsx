import React, { useState, useEffect } from 'react';
import {
  Sliders, Plus, Edit2, Trash2, Eye, EyeOff, Sparkles, Image as ImageIcon,
  CheckCircle2, XCircle, ArrowRight, Upload, Link as LinkIcon, Loader2, RefreshCw, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideApi } from '../../lib/api';
import { showSuccess, showError, showDelete } from '../../lib/toastUtils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const PRESET_LINKS = [
  { label: 'All Products', path: '/shop' },
  { label: 'Women', path: '/shop?section=women' },
  { label: 'Men', path: '/shop?section=men' },
  { label: 'Kids', path: '/shop?section=kids' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Track Order', path: '/track' },
];

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    eyebrow: '',
    badgeText: '',
    buttonText: 'Shop Now',
    linkPath: '/shop',
    secondaryButtonText: '',
    secondaryLinkPath: '',
    order: 0,
    isActive: true,
    imageUrl: '',
    showStats: false,
    stat1Value: '10K+',
    stat1Label: 'Happy Customers',
    stat2Value: '500+',
    stat2Label: 'Styles Available',
    stat3Value: '4.9★',
    stat3Label: 'Average Rating',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchSlides = () => {
    setLoading(true);
    slideApi
      .getAllAdmin()
      .then((res) => {
        setSlides(res.slides || []);
      })
      .catch((err) => {
        showError(err.message || 'Failed to load slides');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openCreateModal = () => {
    setEditingSlide(null);
    setFormData({
      title: 'New Summer Collection 2025',
      subtitle: 'Discover effortless style crafted with premium fabrics.',
      eyebrow: 'New Season',
      badgeText: '',
      buttonText: 'Shop Collection',
      linkPath: '/shop',
      secondaryButtonText: 'Learn More',
      secondaryLinkPath: '/about',
      order: slides.length,
      isActive: true,
      showStats: false,
      stat1Value: '10K+',
      stat1Label: 'Happy Customers',
      stat2Value: '500+',
      stat2Label: 'Styles Available',
      stat3Value: '4.9★',
      stat3Label: 'Average Rating',
    });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const openEditModal = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      eyebrow: slide.eyebrow || '',
      badgeText: slide.badgeText || '',
      buttonText: slide.buttonText || 'Shop Now',
      linkPath: slide.linkPath || '/shop',
      secondaryButtonText: slide.secondaryButtonText || '',
      secondaryLinkPath: slide.secondaryLinkPath || '',
      order: slide.order ?? 0,
      isActive: slide.isActive ?? true,
      showStats: slide.showStats ?? false,
      stat1Value: slide.stat1Value || '',
      stat1Label: slide.stat1Label || '',
      stat2Value: slide.stat2Value || '',
      stat2Label: slide.stat2Label || '',
      stat3Value: slide.stat3Value || '',
      stat3Label: slide.stat3Label || '',
    });
    setImageFile(null);
    setImagePreview(resolveImg(slide.image));
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleToggleStatus = async (slide) => {
    try {
      const newStatus = !slide.isActive;
      await slideApi.updateStatus(slide._id, newStatus);
      setSlides((prev) =>
        prev.map((s) => (s._id === slide._id ? { ...s, isActive: newStatus } : s))
      );
      showSuccess(`Slide ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      showError(err.message || 'Failed to update slide status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      await slideApi.delete(id);
      setSlides((prev) => prev.filter((s) => s._id !== id));
      showDelete('Slide deleted.');
    } catch (err) {
      showError(err.message || 'Failed to delete slide');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingSlide && !imageFile) {
      showError('Please upload an image file for the slide');
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      if (imageFile) {
        payload.append('image', imageFile);
      }
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (editingSlide) {
        await slideApi.update(editingSlide._id, payload);
        showSuccess('Slide updated successfully!');
      } else {
        await slideApi.create(payload);
        showSuccess('New Hero Slide added!');
      }

      setModalOpen(false);
      fetchSlides();
    } catch (err) {
      showError(err.message || 'Failed to save slide');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders size={20} className="text-[#c9a96e]" />
            <h1 className="text-xl font-bold text-gray-900">Hero Slider Manager</h1>
          </div>
          <p className="text-xs text-gray-500">
            Customize home page (`/`) slider slides. You can set image, text, button links, and optional stats counters per slide.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSlides}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-[#c9a96e] transition-colors shadow-sm"
          >
            <Plus size={16} /> Add New Slide
          </button>
        </div>
      </div>

      {/* Slides List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
          <Loader2 size={32} className="animate-spin text-[#c9a96e]" />
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4 text-[#c9a96e]">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No Custom Hero Slides Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Add your first custom banner slide with custom headings, images, links, and optional stats.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-[#c9a96e] transition-colors"
          >
            <Plus size={16} /> Create First Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slides.map((slide, index) => (
            <motion.div
              key={slide._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                slide.isActive ? 'border-gray-200 shadow-xs' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              {/* Card Header & Preview */}
              <div>
                <div className="relative aspect-[16/9] bg-gray-950 overflow-hidden">
                  <img
                    src={resolveImg(slide.image)}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm ${
                        slide.isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {slide.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {slide.isActive ? 'Active' : 'Disabled'}
                    </span>
                    <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Order: {slide.order}
                    </span>
                    {slide.showStats && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <BarChart2 size={10} /> Stats Enabled
                      </span>
                    )}
                  </div>

                  {/* Overlay text preview */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    {slide.eyebrow && (
                      <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 block mb-1">
                        {slide.eyebrow}
                      </span>
                    )}
                    <h3 className="text-base font-bold line-clamp-1">{slide.title}</h3>
                    {slide.subtitle && (
                      <p className="text-[11px] text-gray-300 line-clamp-1">{slide.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400 font-medium">Primary Link Path:</span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                      {slide.linkPath || '/shop'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400 font-medium">Primary Button:</span>
                    <span className="font-semibold text-gray-800">{slide.buttonText || 'Shop Now'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400 font-medium">Stats Row:</span>
                    <span className={`font-semibold ${slide.showStats ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {slide.showStats ? 'Shown on Slide' : 'Hidden (Disabled)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(slide)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                    slide.isActive
                      ? 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {slide.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  {slide.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(slide)}
                    className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200 transition-colors"
                    title="Edit Slide"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(slide._id)}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                    title="Delete Slide"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Sliders size={18} className="text-[#c9a96e]" />
                  {editingSlide ? 'Edit Hero Slide' : 'Create New Hero Slide'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                
                {/* Image Section */}
                <div>
                  <label className="font-bold text-gray-700 mb-1.5 block">
                    Slide Image <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#c9a96e] hover:bg-amber-50/40 transition-colors text-center">
                        <Upload size={26} className="text-gray-400 mb-1.5" />
                        <span className="text-xs font-bold text-gray-800">
                          {imageFile ? imageFile.name : 'Upload New Slide Image'}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>

                    <div>
                      {imagePreview ? (
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-semibold block">Current Image Preview:</span>
                          <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-xs">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[16/9] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                          <ImageIcon size={24} />
                          <span className="text-[10px] mt-1">No image selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Eyebrow & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Eyebrow / Tag Text</label>
                    <input
                      type="text"
                      placeholder="e.g. New Season — Summer 2025"
                      value={formData.eyebrow}
                      onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#c9a96e]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Badge Text (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Up to 50% OFF"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#c9a96e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 mb-1 block">
                    Slide Heading / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dress in Your Fade Find"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#c9a96e]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Subtitle / Description</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Discover effortless style crafted with premium fabrics."
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#c9a96e]"
                  />
                </div>

                {/* Button 1 & Link Path */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <LinkIcon size={14} className="text-[#c9a96e]" /> Primary CTA Button & Link Path
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-gray-600 mb-1 block">Button Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Shop Now"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl outline-none focus:border-[#c9a96e]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-600 mb-1 block">
                        Link Path (Relative Route)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /shop or /about or /contact"
                        value={formData.linkPath}
                        onChange={(e) => setFormData({ ...formData, linkPath: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl outline-none focus:border-[#c9a96e] font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Preset path chips */}
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block mb-1.5">Click preset path:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_LINKS.map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setFormData({ ...formData, linkPath: preset.path })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            formData.linkPath === preset.path
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {preset.label} ({preset.path})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Optional Stats Counter Section */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                      <BarChart2 size={14} className="text-[#c9a96e]" /> Optional Stats Counter Row (10K+ Happy Customers...)
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showStats}
                        onChange={(e) => setFormData({ ...formData, showStats: e.target.checked })}
                        className="w-4 h-4 accent-[#c9a96e] rounded"
                      />
                      <span className="font-bold text-xs text-amber-900">Show Stats on Slide</span>
                    </label>
                  </div>

                  {formData.showStats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-gray-600 text-[11px] block">Stat 1 (Value & Label)</label>
                        <input
                          type="text"
                          placeholder="e.g. 10K+"
                          value={formData.stat1Value}
                          onChange={(e) => setFormData({ ...formData, stat1Value: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          placeholder="e.g. Happy Customers"
                          value={formData.stat1Label}
                          onChange={(e) => setFormData({ ...formData, stat1Label: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg text-gray-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-600 text-[11px] block">Stat 2 (Value & Label)</label>
                        <input
                          type="text"
                          placeholder="e.g. 500+"
                          value={formData.stat2Value}
                          onChange={(e) => setFormData({ ...formData, stat2Value: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          placeholder="e.g. Styles Available"
                          value={formData.stat2Label}
                          onChange={(e) => setFormData({ ...formData, stat2Label: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg text-gray-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-600 text-[11px] block">Stat 3 (Value & Label)</label>
                        <input
                          type="text"
                          placeholder="e.g. 4.9★"
                          value={formData.stat3Value}
                          onChange={(e) => setFormData({ ...formData, stat3Value: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          placeholder="e.g. Average Rating"
                          value={formData.stat3Label}
                          onChange={(e) => setFormData({ ...formData, stat3Label: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg text-gray-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Order & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Order Position</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#c9a96e]"
                    />
                    <span className="text-[10px] text-gray-400">Lower numbers appear first</span>
                  </div>

                  <div className="flex items-center gap-3 pt-4 sm:pt-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 accent-[#c9a96e] rounded"
                      />
                      <span className="font-bold text-gray-800">Slide is Active</span>
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-[#c9a96e] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {editingSlide ? 'Update Slide' : 'Create Slide'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
