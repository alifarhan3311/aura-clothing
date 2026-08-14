import React, { useState } from 'react';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminDetailView from '../../components/admin/AdminDetailView';
import AdminFormModal from '../../components/admin/AdminFormModal';
import CategoryForm from '../../components/admin/forms/CategoryForm';
import { CheckCircle2, XCircle } from 'lucide-react';
import { showSuccess, showError, showDelete } from '../../lib/toastUtils';
import { categoryApi } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CategoriesPage({ categories, setCategories }) {
  const [detailItem, setDetailItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const columns = [
    {
      key: 'image',
      label: 'Image',
      width: '90px',
      sortable: false,
      render: (val, row) => {
        const src = val
          ? (val.startsWith('http') ? val : `${API_BASE}${val}`)
          : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80';
        return (
          <img
            src={src}
            alt={row.name}
            className="w-12 h-9 rounded-xl object-cover border border-gray-200 shadow-xs"
          />
        );
      },
    },
    {
      key: 'section',
      label: 'Section',
      sortable: true,
      render: (val) => {
        const colorMap = {
          women: 'bg-pink-50 text-pink-700 border-pink-200',
          men: 'bg-blue-50 text-blue-700 border-blue-200',
          kids: 'bg-amber-50 text-amber-700 border-amber-200',
        };
        const cls = colorMap[val] || 'bg-gray-50 text-gray-500 border-gray-200';
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${cls}`}>
            {val || '—'}
          </span>
        );
      },
    },
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      render: (val) => <span className="font-bold text-gray-900">{val}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (val) => <span className="text-gray-500 line-clamp-1 max-w-xs">{val || '—'}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (val) =>
        val ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Inactive
          </span>
        ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (val) => (
        <span className="text-gray-400 text-[11px]">
          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </span>
      ),
    },
  ];

  const handleCreate = async (formData) => {
    try {
      const res = await categoryApi.create(formData);
      const newCategory = res.data || res.category || res;
      setCategories([newCategory, ...categories]);
      setIsCreateOpen(false);
      showSuccess(`Category "${newCategory.name || formData.get?.('name')}" created successfully!`);
    } catch (error) {
      showError(error.message || 'Failed to create category');
    }
  };

  const handleEdit = async (formData) => {
    try {
      const res = await categoryApi.update(editingItem._id, formData);
      const updated = res.data || res.category || { ...editingItem };
      setCategories((prev) => prev.map((c) => (c._id === editingItem._id ? updated : c)));
      setEditingItem(null);
      showSuccess('Category updated successfully!');
    } catch (error) {
      showError(error.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoryApi.delete(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      showDelete('Category deleted.');
    } catch (error) {
      showError(error.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <AdminDataTable
        title="Categories Directory"
        subtitle="Organize product collections, banners, and catalog taxonomy"
        columns={columns}
        data={categories}
        onView={(row) => setDetailItem(row)}
        onEdit={(row) => setEditingItem(row)}
        onDelete={handleDelete}
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Add Category"
        searchPlaceholder="Search category name or description..."
        filterOptions={[
          {
            key: 'section',
            label: 'Section',
            options: [
              { label: 'Women', value: 'women' },
              { label: 'Men', value: 'men' },
              { label: 'Kids', value: 'kids' },
            ],
          },
          {
            key: 'isActive',
            label: 'Status',
            options: [
              { label: 'Active', value: true },
              { label: 'Inactive', value: false },
            ],
          },
        ]}
      />

      <AdminDetailView
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        title={detailItem?.name}
        type="category"
        data={detailItem}
      />

      <AdminFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Category"
        isEdit={false}
      >
        <CategoryForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
      </AdminFormModal>

      <AdminFormModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={`Edit Category: ${editingItem?.name}`}
        isEdit={true}
      >
        <CategoryForm
          initialData={editingItem}
          onSubmit={handleEdit}
          onCancel={() => setEditingItem(null)}
        />
      </AdminFormModal>
    </div>
  );
}
