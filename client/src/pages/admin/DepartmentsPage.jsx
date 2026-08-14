import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon,
  CheckCircle2, XCircle, Upload, Loader2, RefreshCw, Sparkles, Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { departmentApi } from '../../lib/api';
import { showSuccess, showError, showDelete } from '../../lib/toastUtils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveImg(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    icon: '✨',
    order: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchDepartments = () => {
    setLoading(true);
    departmentApi
      .getAllAdmin()
      .then((res) => {
        setDepartments(res.departments || []);
      })
      .catch((err) => {
        showError(err.message || 'Failed to load departments');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      subtitle: '',
      icon: '✨',
      order: departments.length + 1,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || '',
      subtitle: dept.subtitle || '',
      icon: dept.icon || '✨',
      order: dept.order ?? 0,
      isActive: dept.isActive ?? true,
    });
    setImageFile(null);
    setImagePreview(resolveImg(dept.image));
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleToggleStatus = async (dept) => {
    try {
      const newStatus = !dept.isActive;
      await departmentApi.updateStatus(dept._id, newStatus);
      setDepartments((prev) =>
        prev.map((d) => (d._id === dept._id ? { ...d, isActive: newStatus } : d))
      );
      showSuccess(`Department ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      showError(err.message || 'Failed to update department status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? Categories under it will be unlinked.')) return;
    try {
      await departmentApi.delete(id);
      setDepartments((prev) => prev.filter((d) => d._id !== id));
      showDelete('Department deleted.');
    } catch (err) {
      showError(err.message || 'Failed to delete department');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = new FormData();
      if (imageFile) {
        payload.append('image', imageFile);
      }
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (editingDept) {
        await departmentApi.update(editingDept._id, payload);
        showSuccess('Department updated successfully!');
      } else {
        await departmentApi.create(payload);
        showSuccess('New Department created!');
      }

      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      showError(err.message || 'Failed to save department');
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
            <Layers size={20} className="text-[#c9a96e]" />
            <h1 className="text-xl font-bold text-gray-900">Departments / Top Sections Manager</h1>
          </div>
          <p className="text-xs text-gray-500">
            Manage top-level sections (e.g. Women, Men, Kids, Babies, Young Boys, Teens) that appear in "Find Your Style" circle cards and shop tabs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDepartments}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-[#c9a96e] transition-colors shadow-sm"
          >
            <Plus size={16} /> Add New Department
          </button>
        </div>
      </div>

      {/* Grid of Departments */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
          <Loader2 size={32} className="animate-spin text-[#c9a96e]" />
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4 text-[#c9a96e]">
            <Layers size={32} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No Departments Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Create departments like Women, Men, Kids, Babies, Teens to categorize your collections.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-[#c9a96e] transition-colors"
          >
            <Plus size={16} /> Create Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <motion.div
              key={dept._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className={`bg-white rounded-3xl border transition-all overflow-hidden p-5 flex flex-col justify-between ${
                dept.isActive ? 'border-gray-200 shadow-xs' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              <div>
                {/* Header with Circle Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#c9a96e]/40 shadow-md bg-gray-100 shrink-0 relative">
                    {dept.image ? (
                      <img
                        src={resolveImg(dept.image)}
                        alt={dept.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {dept.icon || '✨'}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{dept.icon || '✨'}</span>
                      <h3 className="font-bold text-gray-900 text-lg truncate">{dept.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate">{dept.subtitle || `/${dept.slug}`}</p>
                    <span className="inline-block mt-1 font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      slug: {dept.slug}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                <button
                  onClick={() => handleToggleStatus(dept)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                    dept.isActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 bg-gray-100 text-gray-600'
                  }`}
                >
                  {dept.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {dept.isActive ? 'Active' : 'Disabled'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(dept)}
                    className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
                    title="Edit Department"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Form */}
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Layers size={18} className="text-[#c9a96e]" />
                  {editingDept ? 'Edit Department' : 'Create New Department'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Department Image & Avatar Preview */}
                <div>
                  <label className="font-bold text-gray-700 mb-1.5 block">
                    Circle Card Image (Shown on Homepage "Find Your Style")
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{formData.icon || '✨'}</span>
                      )}
                    </div>
                    <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#c9a96e] hover:bg-amber-50/40 transition-colors text-center">
                      <Upload size={20} className="text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-800">
                        {imageFile ? imageFile.name : 'Upload Circle Image'}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Square or Portrait image</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Name & Emoji Icon */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="font-bold text-gray-700 mb-1 block">
                      Department Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Babies, Women, Young Boys, Teens"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#c9a96e]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Emoji Icon</label>
                    <input
                      type="text"
                      placeholder="e.g. 👶, 👗, 👔"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-base text-center outline-none focus:border-[#c9a96e]"
                    />
                  </div>
                </div>

                {/* Subtitle / Tagline */}
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Subtitle / Short Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Cute & Soft, Elegant & Effortless, Playful & Comfy"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#c9a96e]"
                  />
                </div>

                {/* Order & Status */}
                <div className="grid grid-cols-2 gap-3 items-center pt-2">
                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Sort Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#c9a96e]"
                    />
                  </div>
                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 accent-[#c9a96e] rounded"
                      />
                      <span className="font-bold text-gray-800">Active</span>
                    </label>
                  </div>
                </div>

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
                    {editingDept ? 'Update Department' : 'Create Department'}
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
