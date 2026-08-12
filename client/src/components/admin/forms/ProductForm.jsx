import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Tag, Layers, Upload, X, Palette, Images } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductForm({ initialData = null, brands = [], categories = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    isActive: true,
    isFeatured: false,
    colors: [],          // product-level colors e.g. ["Red", "Blue"]
    variants: [
      {
        _id: 'var-temp-1',
        color: 'Standard',
        size: 'M',
        price: 9900,
        discount: 0,
        stock: 10,
        images: [],
      },
    ],
  });

  // Main image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Gallery images (multiple)
  const [galleryFiles, setGalleryFiles] = useState([]);        // new File objects to upload
  const [galleryPreviews, setGalleryPreviews] = useState([]);  // {url, isExisting, path} objects
  const [removedImages, setRemovedImages] = useState([]);      // existing paths to delete on server
  const galleryInputRef = useRef(null);

  // Color input state
  const [colorInput, setColorInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        brand: typeof initialData.brand === 'object' ? initialData.brand._id : (initialData.brand || (brands[0]?._id || '')),
        category: typeof initialData.category === 'object' ? initialData.category._id : (initialData.category || (categories[0]?._id || '')),
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        isFeatured: initialData.isFeatured !== undefined ? initialData.isFeatured : false,
        colors: initialData.colors || [],
        variants: initialData.variants && initialData.variants.length > 0 ? initialData.variants : [
          { _id: 'var-temp-1', color: 'Standard', size: 'M', price: 9900, discount: 0, stock: 10, images: [] }
        ],
      });

      if (initialData.mainImage) {
        const src = initialData.mainImage.startsWith('http')
          ? initialData.mainImage
          : `${API_BASE}${initialData.mainImage}`;
        setImagePreview(src);
      }

      // Load existing gallery images
      if (initialData.images?.length) {
        setGalleryPreviews(
          initialData.images.map((imgPath) => ({
            url: imgPath.startsWith('http') ? imgPath : `${API_BASE}${imgPath}`,
            isExisting: true,
            path: imgPath,
          }))
        );
      }
    } else {
      if (brands.length > 0) setFormData((prev) => ({ ...prev, brand: prev.brand || brands[0]._id }));
      if (categories.length > 0) setFormData((prev) => ({ ...prev, category: prev.category || categories[0]._id }));
    }
  }, [initialData, brands, categories]);

  // ── Main image handlers ──────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Gallery image handlers ───────────────────────────────────────────────────
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isExisting: false,
      file,
    }));

    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input so same files can be re-selected if needed
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const removeGalleryImage = (index) => {
    const item = galleryPreviews[index];
    if (item.isExisting) {
      // Mark for server-side deletion on submit
      setRemovedImages((prev) => [...prev, item.path]);
    } else {
      // Remove from new files list
      setGalleryFiles((prev) => {
        const updated = [...prev];
        updated.splice(
          galleryFiles.findIndex((f) => f === item.file),
          1
        );
        return updated;
      });
    }
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Color tag handlers ────────────────────────────────────────────────────────
  const addColor = () => {
    const trimmed = colorInput.trim();
    if (!trimmed) return;
    if (formData.colors.includes(trimmed)) {
      setColorInput('');
      return;
    }
    setFormData((prev) => ({ ...prev, colors: [...prev.colors, trimmed] }));
    setColorInput('');
  };

  const removeColor = (color) => {
    setFormData((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== color) }));
  };

  const handleColorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColor();
    }
  };

  // ── General change handler ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ── Variant operations ───────────────────────────────────────────────────────
  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          _id: `var-temp-${Date.now()}`,
          color: 'Black',
          size: 'L',
          price: prev.variants[0]?.price || 9900,
          discount: 0,
          stock: 5,
          images: [],
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.brand || !formData.category) return;

    const formattedVariants = formData.variants.map((v) => {
      // Strip temp _id strings (e.g. "var-temp-1") — Mongoose will generate a real ObjectId
      // Keep real ObjectIds (24-char hex) so existing variants are preserved on update
      const isRealObjectId = /^[a-f\d]{24}$/i.test(v._id);
      const { _id, ...rest } = v;
      return {
        ...(isRealObjectId ? { _id } : {}),
        ...rest,
        price: Number(v.price),
        discount: Number(v.discount || 0),
        stock: Number(v.stock || 0),
      };
    });

    const fd = new FormData();
    fd.append('name', formData.name.trim());
    fd.append('description', formData.description.trim());
    fd.append('brand', formData.brand);
    fd.append('category', formData.category);
    fd.append('isActive', formData.isActive);
    fd.append('isFeatured', formData.isFeatured);
    fd.append('variants', JSON.stringify(formattedVariants));
    fd.append('colors', JSON.stringify(formData.colors));

    if (imageFile) {
      fd.append('mainImage', imageFile);
    }

    // Append each new gallery image
    galleryFiles.forEach((file) => {
      fd.append('productImages', file);
    });

    // Tell server which existing images to remove
    if (removedImages.length > 0) {
      fd.append('removeImages', JSON.stringify(removedImages));
    }

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Product Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Royal Emerald Velvet Suit"
          className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all font-semibold"
        />
      </div>

      {/* Brand & Category Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Tag size={13} className="text-[#c9a96e]" /> Brand <span className="text-rose-500">*</span>
          </label>
          <select
            name="brand"
            required
            value={formData.brand}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all font-medium"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Layers size={13} className="text-[#c9a96e]" /> Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all font-medium"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Product Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="description"
          required
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed description of fabric, embroidery, design, and styling instructions..."
          className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all resize-none"
        />
      </div>

      {/* Colors */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Palette size={13} className="text-[#c9a96e]" /> Available Colors
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            onKeyDown={handleColorKeyDown}
            placeholder='e.g. Red, Navy Blue (press Enter to add)'
            className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all"
          />
          <button
            type="button"
            onClick={addColor}
            className="px-3 py-2 text-xs font-semibold bg-gray-900 text-white rounded-xl hover:bg-[#c9a96e] transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        {formData.colors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {formData.colors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#f0e4cc]/60 text-amber-900 border border-[#c9a96e]/30 rounded-full"
              >
                {color}
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="text-amber-700 hover:text-rose-500 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Image File Upload */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Main Display Image
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 px-3.5 py-2.5 text-xs bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#c9a96e] hover:bg-[#f0e4cc]/20 transition-all"
        >
          <Upload size={14} className="text-gray-400" />
          <span className="text-gray-500 font-medium">
            {imageFile ? imageFile.name : 'Click to upload main product image (JPG, PNG, WebP — max 10 MB)'}
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {imagePreview && (
          <div className="mt-2.5 flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
            <img
              src={imagePreview}
              alt="Main Preview"
              className="w-12 h-14 rounded-lg object-cover border border-gray-200"
            />
            <span className="text-[11px] text-gray-500 font-medium flex-1">Main Image Preview</span>
            <button type="button" onClick={clearImage} className="p-1 text-gray-400 hover:text-rose-500 rounded transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Gallery / Multiple Images */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Images size={13} className="text-[#c9a96e]" /> Product Gallery
          <span className="text-[10px] text-gray-400 font-normal normal-case ml-1">(max 10 images)</span>
        </label>
        <div
          onClick={() => galleryInputRef.current?.click()}
          className="flex items-center gap-3 px-3.5 py-2.5 text-xs bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#c9a96e] hover:bg-[#f0e4cc]/20 transition-all"
        >
          <Upload size={14} className="text-gray-400" />
          <span className="text-gray-500 font-medium">
            Click to add gallery images (select multiple)
          </span>
        </div>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleGalleryChange}
        />

        {galleryPreviews.length > 0 && (
          <div className="mt-2.5 grid grid-cols-5 gap-2">
            {galleryPreviews.map((item, index) => (
              <div key={index} className="relative group">
                <img
                  src={item.url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-white/90 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <X size={11} />
                </button>
                {item.isExisting && (
                  <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-gray-800/70 text-white px-1 rounded">saved</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Variants Sub-form */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Product Variants ({formData.variants.length})
          </label>
          <button
            type="button"
            onClick={addVariant}
            className="text-xs font-semibold text-[#c9a96e] hover:text-amber-800 flex items-center gap-1 hover:underline"
          >
            <Plus size={14} /> Add Variant
          </button>
        </div>

        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {formData.variants.map((variant, index) => (
            <div key={variant._id || index} className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Color</span>
                  <input
                    type="text"
                    required
                    value={variant.color}
                    onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                    placeholder="Color"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Size</span>
                  <input
                    type="text"
                    required
                    value={variant.size}
                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                    placeholder="Size"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Price (PKR)</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={variant.price}
                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Discount %</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={variant.discount}
                    onChange={(e) => handleVariantChange(index, 'discount', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Stock</span>
                    <input
                      type="number"
                      min={0}
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
                    />
                  </div>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="mt-4 p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Remove variant"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visibility & Feature Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <span className="text-xs font-bold text-gray-800 block">Active Listing</span>
            <span className="text-[10px] text-gray-500">Show on catalog page</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c9a96e]" />
          </label>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <span className="text-xs font-bold text-gray-800 block">Featured Banner</span>
            <span className="text-[10px] text-gray-500">Highlight on homepage</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-[#c9a96e] rounded-xl transition-colors shadow-sm"
        >
          {initialData ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
