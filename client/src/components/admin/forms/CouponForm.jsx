import React, { useState, useEffect } from 'react';

export default function CouponForm({ initialData = null, availableProducts = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minimumPurchase: 0,
    maximumDiscount: '',
    startDate: '',
    expiryDate: '',
    usageLimit: '',
    products: [],
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        description: initialData.description || '',
        discountType: initialData.discountType || 'percentage',
        discountValue: initialData.discountValue ?? 10,
        minimumPurchase: initialData.minimumPurchase ?? 0,
        maximumDiscount: initialData.maximumDiscount ?? '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
        usageLimit: initialData.usageLimit ?? '',
        products: initialData.products || [],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      // Default dates (today to +30 days)
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, startDate: today, expiryDate: nextMonth }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'code' ? value.toUpperCase() : value,
    }));
  };

  const toggleProductSelect = (prodId) => {
    setFormData((prev) => {
      const exists = prev.products.includes(prodId);
      return {
        ...prev,
        products: exists ? prev.products.filter((id) => id !== prodId) : [...prev.products, prodId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return;
    
    onSubmit({
      ...formData,
      discountValue: Number(formData.discountValue),
      minimumPurchase: Number(formData.minimumPurchase || 0),
      maximumDiscount: formData.maximumDiscount ? Number(formData.maximumDiscount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Code & Discount Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Coupon Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="code"
            required
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g. FESTIVE20"
            className="w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Discount Type <span className="text-rose-500">*</span>
          </label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all cursor-pointer font-medium"
          >
            <option value="percentage">Percentage (%) Discount</option>
            <option value="fixed">Fixed Amount (PKR) Discount</option>
          </select>
        </div>
      </div>

      {/* Discount Value & Min Purchase */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Discount Value {formData.discountType === 'percentage' ? '(%)' : '(PKR)'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="discountValue"
            min={0}
            max={formData.discountType === 'percentage' ? 100 : undefined}
            required
            value={formData.discountValue}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Min Purchase (PKR)
          </label>
          <input
            type="number"
            name="minimumPurchase"
            min={0}
            value={formData.minimumPurchase}
            onChange={handleChange}
            placeholder="0"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Max Discount Cap (PKR)
          </label>
          <input
            type="number"
            name="maximumDiscount"
            min={0}
            value={formData.maximumDiscount}
            onChange={handleChange}
            placeholder="Optional limit"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all"
          />
        </div>
      </div>

      {/* Dates & Usage Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Start Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="startDate"
            required
            value={formData.startDate}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Expiry Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="expiryDate"
            required
            value={formData.expiryDate}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Usage Limit
          </label>
          <input
            type="number"
            name="usageLimit"
            min={1}
            value={formData.usageLimit}
            onChange={handleChange}
            placeholder="Unlimited"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          rows={2}
          value={formData.description}
          onChange={handleChange}
          placeholder="Terms and conditions or offer text..."
          className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all resize-none"
        />
      </div>

      {/* Specific Products Assignment */}
      {availableProducts.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Specific Products (Leave empty for storewide)
          </label>
          <div className="max-h-36 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            {availableProducts.map((prod) => {
              const isSelected = formData.products.includes(prod._id);
              return (
                <div
                  key={prod._id}
                  onClick={() => toggleProductSelect(prod._id)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#f0e4cc] text-gray-900 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="truncate max-w-[320px]">{prod.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">ID: {prod._id}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Toggle */}
      <div className="pt-2 flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <span className="text-xs font-bold text-gray-800 block">Active Status</span>
          <span className="text-[11px] text-gray-500">Enable coupon code redemption at checkout</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
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
          {initialData ? 'Save Changes' : 'Create Coupon'}
        </button>
      </div>
    </form>
  );
}
