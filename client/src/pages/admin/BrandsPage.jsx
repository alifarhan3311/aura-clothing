import React, { useState } from 'react';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminDetailView from '../../components/admin/AdminDetailView';
import AdminFormModal from '../../components/admin/AdminFormModal';
import BrandForm from '../../components/admin/forms/BrandForm';
import { CheckCircle2, XCircle } from 'lucide-react';
import { showSuccess, showError, showDelete } from '../../lib/toastUtils';
import { brandApi } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BrandsPage({ brands, setBrands }) {
  const [detailItem, setDetailItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const columns = [
    {
      key: 'logo',
      label: 'Logo',
      width: '80px',
      sortable: false,
      render: (val, row) => {
        const src = val
          ? (val.startsWith('http') ? val : `${API_BASE}${val}`)
          : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80';
        return (
          <img
            src={src}
            alt={row.name}
            className="w-10 h-10 rounded-xl object-cover border border-gray-200 shadow-xs"
          />
        );
      },
    },
    {
      key: 'name',
      label: 'Brand Name',
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
      const res = await brandApi.create(formData);
      const newBrand = res.data || res.brand || res;
      setBrands([newBrand, ...brands]);
      setIsCreateOpen(false);
      showSuccess(`Brand "${newBrand.name || formData.get?.('name')}" created successfully!`);
    } catch (error) {
      showError(error.message || 'Failed to create brand');
    }
  };

  const handleEdit = async (formData) => {
    try {
      const res = await brandApi.update(editingItem._id, formData);
      const updated = res.data || res.brand || { ...editingItem };
      setBrands((prev) => prev.map((b) => (b._id === editingItem._id ? updated : b)));
      setEditingItem(null);
      showSuccess('Brand updated successfully!');
    } catch (error) {
      showError(error.message || 'Failed to update brand');
    }
  };

  const handleDelete = async (id) => {
    try {
      await brandApi.delete(id);
      setBrands((prev) => prev.filter((b) => b._id !== id));
      showDelete('Brand deleted.');
    } catch (error) {
      showError(error.message || 'Failed to delete brand');
    }
  };

  return (
    <div className="space-y-6">
      <AdminDataTable
        title="Brands Directory"
        subtitle="Manage brand identities, descriptions, and active flags"
        columns={columns}
        data={brands}
        onView={(row) => setDetailItem(row)}
        onEdit={(row) => setEditingItem(row)}
        onDelete={handleDelete}
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Add Brand"
        searchPlaceholder="Search brand name or description..."
        filterOptions={[
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
        type="brand"
        data={detailItem}
      />

      <AdminFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Brand"
        isEdit={false}
      >
        <BrandForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
      </AdminFormModal>

      <AdminFormModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={`Edit Brand: ${editingItem?.name}`}
        isEdit={true}
      >
        <BrandForm
          initialData={editingItem}
          onSubmit={handleEdit}
          onCancel={() => setEditingItem(null)}
        />
      </AdminFormModal>
    </div>
  );
}
