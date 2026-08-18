import React from 'react';
import { X, Calendar, Hash, CheckCircle2, XCircle, Tag, Package, User, Layers, Ticket, Palette, Images } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

export default function AdminDetailView({ isOpen, onClose, title, type, data }) {
  if (!isOpen || !data) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const renderBadge = (active) => (
    active ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={13} /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle size={13} /> Inactive
      </span>
    )
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col z-10"
        >
          {/* Top Bar */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c9a96e]/10 text-[#c9a96e] flex items-center justify-center font-bold">
                {type === 'brand' && <Tag size={20} />}
                {type === 'category' && <Layers size={20} />}
                {type === 'product' && <Package size={20} />}
                {type === 'coupon' && <Ticket size={20} />}
                {type === 'user' && <User size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{title || 'Entry Details'}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                  <Hash size={12} />
                  <span>ID: {data._id}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Details Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700">
            {/* Header Info Card */}
            {(data.logo || data.image || data.mainImage || data.avatar) && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <img
                  src={resolveUrl(data.logo || data.image || data.mainImage || data.avatar)}
                  alt={data.name || 'Preview'}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-xs"
                />
                <div>
                  <h4 className="text-base font-bold text-gray-900">{data.name || data.code}</h4>
                  {data.email && <p className="text-xs text-gray-500">{data.email}</p>}
                  {data.description && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{data.description}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    {data.isActive !== undefined && renderBadge(data.isActive)}
                    {data.isVerified !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${data.isVerified ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600'}`}>
                        {data.isVerified ? 'Verified Account' : 'Unverified'}
                      </span>
                    )}
                    {data.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        ★ Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* General Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Title / Name
                </span>
                <span className="font-semibold text-gray-900 text-sm">{data.name || data.code || '—'}</span>
              </div>

              {/* Product: Brand & Category */}
              {data.brand && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Brand
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {typeof data.brand === 'object' ? data.brand.name : data.brand}
                  </span>
                </div>
              )}

              {data.category && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Category
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {typeof data.category === 'object' ? data.category.name : data.category}
                  </span>
                </div>
              )}

              {data.role && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    User Role
                  </span>
                  <span className="font-semibold text-gray-900 uppercase tracking-wider text-xs px-2 py-1 rounded bg-gray-200 inline-block">
                    {data.role}
                  </span>
                </div>
              )}

              {data.section && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Catalog Section
                  </span>
                  <span className="font-semibold text-gray-900 capitalize px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-800 border border-amber-200 inline-block">
                    {data.section}
                  </span>
                </div>
              )}

              {data.slug && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Slug
                  </span>
                  <span className="font-mono text-xs text-gray-600">{data.slug}</span>
                </div>
              )}

              {data.discountType && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Discount Rate
                  </span>
                  <span className="font-bold text-amber-700 text-sm">
                    {data.discountType === 'percentage' ? `${data.discountValue}% OFF` : `PKR ${data.discountValue} OFF`}
                  </span>
                </div>
              )}

              {data.minimumPurchase !== undefined && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Min Purchase
                  </span>
                  <span className="font-semibold text-gray-900">PKR {data.minimumPurchase}</span>
                </div>
              )}

              {data.maximumDiscount !== undefined && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Max Discount Cap
                  </span>
                  <span className="font-semibold text-gray-900">
                    {data.maximumDiscount ? `PKR ${data.maximumDiscount}` : 'No Limit'}
                  </span>
                </div>
              )}

              {data.usedCount !== undefined && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Coupon Usage
                  </span>
                  <span className="font-semibold text-gray-900">
                    {data.usedCount} / {data.usageLimit || '∞'} times used
                  </span>
                </div>
              )}

              {data.phone && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Phone Number
                  </span>
                  <span className="font-semibold text-gray-900">{data.phone}</span>
                </div>
              )}
            </div>

            {/* Description section */}
            {data.description && (
              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-gray-700 leading-relaxed">{data.description}</p>
              </div>
            )}

            {/* User Address Section */}
            {data.address && (
              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Default Shipping Address
                </span>
                <p className="font-semibold text-gray-800">
                  {data.address.street || (typeof data.address === 'string' ? data.address : 'No street address specified')}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {[
                    data.address.city,
                    data.address.state,
                    data.address.postalCode || data.address.zip,
                    data.address.country || 'Pakistan',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}

            {/* Product type tags */}
            {data.type && data.type.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.type.map((t) => (
                  <span key={t} className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Variants table for Product */}
            {data.variants && data.variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Product Variants ({data.variants.length})
                </span>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-2.5">Color</th>
                        <th className="p-2.5">Size</th>
                        <th className="p-2.5">Price</th>
                        <th className="p-2.5">Discount</th>
                        <th className="p-2.5">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.variants.map((v, idx) => (
                        <tr key={v._id || idx} className="hover:bg-gray-50">
                          <td className="p-2.5 font-medium text-gray-900">{v.color}</td>
                          <td className="p-2.5">{v.size}</td>
                          <td className="p-2.5 font-semibold text-gray-900">PKR {v.price}</td>
                          <td className="p-2.5 text-amber-700">{v.discount}%</td>
                          <td className="p-2.5 font-bold text-emerald-600">{v.stock} pcs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Colors for Product */}
            {data.colors && data.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Palette size={13} className="text-[#c9a96e]" /> Available Colors ({data.colors.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.colors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center px-3 py-1 text-[11px] font-semibold bg-[#f0e4cc]/60 text-amber-900 border border-[#c9a96e]/30 rounded-full"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Images for Product */}
            {data.images && data.images.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Images size={13} className="text-[#c9a96e]" /> Gallery Images ({data.images.length})
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {data.images.map((imgPath, idx) => (
                    <img
                      key={idx}
                      src={resolveUrl(imgPath)}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-16 rounded-xl object-cover border border-gray-200 shadow-xs"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Product associations for Coupon */}
            {data.products && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Applicable Products ({data.products.length})
                </span>
                <div className="flex flex-wrap gap-2">
                   {data.products.length > 0 ? (
                     data.products.map((p) => {
                       const pid = typeof p === 'object' ? p._id : p;
                       const label = typeof p === 'object' ? (p.name || p._id) : p;
                       return (
                         <span key={pid} className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px]">
                           {label}
                         </span>
                       );
                     })
                   ) : (
                    <span className="text-gray-400 italic">Storewide (Applies to all products)</span>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Created: {formatDate(data.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Updated: {formatDate(data.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-900 text-white font-semibold text-xs rounded-xl hover:bg-[#c9a96e] transition-colors"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
