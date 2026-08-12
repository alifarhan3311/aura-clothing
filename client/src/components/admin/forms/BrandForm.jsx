import React, { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BrandForm({ initialData = null, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  // file upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
      if (initialData.logo) {
        const src = initialData.logo.startsWith('http')
          ? initialData.logo
          : `${API_BASE}${initialData.logo}`;
        setLogoPreview(src);
      }
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setLogoFile(null);
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('description', description.trim());
    fd.append('isActive', String(isActive));
    if (logoFile) {
      fd.append('logo', logoFile);
    }
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Brand Name */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Brand Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aura Luxury"
          className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the brand line..."
          className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all resize-none"
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Logo Image
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 px-3.5 py-2.5 text-xs bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#c9a96e] hover:bg-[#f0e4cc]/20 transition-all"
        >
          <Upload size={14} className="text-gray-400" />
          <span className="text-gray-500 font-medium">
            {logoFile ? logoFile.name : 'Click to upload logo (JPG, PNG, WebP — max 5 MB)'}
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {logoPreview && (
          <div className="mt-2.5 flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
            />
            <span className="text-[11px] text-gray-500 font-medium flex-1">Preview</span>
            <button
              type="button"
              onClick={clearFile}
              className="p-1 text-gray-400 hover:text-rose-500 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Active Toggle */}
      <div className="pt-2 flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <span className="text-xs font-bold text-gray-800 block">Active Status</span>
          <span className="text-[11px] text-gray-500">Enable or disable brand visibility across the store</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a96e]" />
        </label>
      </div>

      {/* Buttons */}
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
          {initialData ? 'Save Changes' : 'Create Brand'}
        </button>
      </div>
    </form>
  );
}
