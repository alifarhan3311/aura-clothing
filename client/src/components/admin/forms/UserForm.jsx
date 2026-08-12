import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, MapPin } from 'lucide-react';

export default function UserForm({ initialData = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isVerified: true,
    avatar: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'Pakistan',
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Blank password on edit
        role: initialData.role || 'user',
        isVerified: initialData.isVerified !== undefined ? initialData.isVerified : true,
        avatar: initialData.avatar || '',
        phone: initialData.phone || '',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          zip: initialData.address?.zip || '',
          country: initialData.address?.country || 'Pakistan',
        },
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    if (!initialData && !formData.password) return; // Password required on create

    const submitPayload = { ...formData };
    if (initialData && !submitPayload.password) {
      delete submitPayload.password;
    }

    onSubmit(submitPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <User size={13} className="text-[#c9a96e]" /> Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Ayesha Malik"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Mail size={13} className="text-[#c9a96e]" /> Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="ayesha@example.com"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all"
          />
        </div>
      </div>

      {/* Password & Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Lock size={13} className="text-[#c9a96e]" /> Password {!initialData && <span className="text-rose-500">*</span>}
          </label>
          <input
            type="password"
            name="password"
            minLength={6}
            required={!initialData}
            value={formData.password}
            onChange={handleChange}
            placeholder={initialData ? 'Leave blank to keep unchanged' : 'At least 6 characters'}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Account Role <span className="text-rose-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all font-medium cursor-pointer"
          >
            <option value="user">Customer (User)</option>
            <option value="admin">Administrator (Admin)</option>
          </select>
        </div>
      </div>

      {/* Avatar URL & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Avatar Image URL
          </label>
          <input
            type="url"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Phone size={13} className="text-[#c9a96e]" /> Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+92 300 1234567"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all"
          />
        </div>
      </div>

      {/* Address Sub-form */}
      <div className="pt-2 p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block flex items-center gap-1">
          <MapPin size={13} className="text-[#c9a96e]" /> Default Shipping Address
        </label>
        <div>
          <input
            type="text"
            name="street"
            value={formData.address.street}
            onChange={handleAddressChange}
            placeholder="Street address / House number"
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <input
            type="text"
            name="city"
            value={formData.address.city}
            onChange={handleAddressChange}
            placeholder="City"
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
          />
          <input
            type="text"
            name="state"
            value={formData.address.state}
            onChange={handleAddressChange}
            placeholder="State / Province"
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
          />
          <input
            type="text"
            name="zip"
            value={formData.address.zip}
            onChange={handleAddressChange}
            placeholder="Postal / ZIP"
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
          />
          <input
            type="text"
            name="country"
            value={formData.address.country}
            onChange={handleAddressChange}
            placeholder="Country"
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
          />
        </div>
      </div>

      {/* Verified Account Toggle */}
      <div className="pt-1 flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <span className="text-xs font-bold text-gray-800 block">Verified Status</span>
          <span className="text-[11px] text-gray-500">Mark user email as verified</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isVerified"
            checked={formData.isVerified}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
        </label>
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
          {initialData ? 'Save Changes' : 'Create User'}
        </button>
      </div>
    </form>
  );
}
