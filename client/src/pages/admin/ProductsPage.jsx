import React, { useState } from 'react';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminDetailView from '../../components/admin/AdminDetailView';
import AdminFormModal from '../../components/admin/AdminFormModal';
import ProductForm from '../../components/admin/forms/ProductForm';
import { CheckCircle2, XCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductsPage({ products, setProducts, brands = [], categories = [] }) {
  const [detailItem, setDetailItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Helper maps for Brand/Category names
  const brandMap = React.useMemo(() => {
    return brands.reduce((acc, b) => ({ ...acc, [b._id]: b.name }), {});
  }, [brands]);

  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, c) => ({ ...acc, [c._id]: c.name }), {});
  }, [categories]);

  // Column definitions matching Product.js schema
  const columns = [
    {
      key: 'mainImage',
      label: 'Product',
      width: '90px',
      sortable: false,
      render: (val, row) => {
        const src = val
          ? (val.startsWith('http') ? val : `${API_BASE}${val}`)
          : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';
        return (
          <img
            src={src}
            alt={row.name}
            className="w-11 h-13 rounded-xl object-cover border border-gray-200 shadow-xs"
          />
        );
      },
    },
    {
      key: 'name',
      label: 'Title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-gray-900 line-clamp-1">{val}</div>
          <div className="text-[10px] text-gray-400 font-mono">ID: {row._id}</div>
        </div>
      ),
    },
    {
      key: 'brand',
      label: 'Brand',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
          {typeof val === 'object' ? val.name : (brandMap[val] || val || '—')}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="text-gray-600 text-[11px] font-medium">
          {typeof val === 'object' ? val.name : (categoryMap[val] || val || '—')}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price (Base)',
      sortable: true,
      render: (_, row) => {
        const basePrice = row.variants && row.variants[0] ? row.variants[0].price : 0;
        return <span className="font-bold text-gray-900">PKR {basePrice.toLocaleString()}</span>;
      },
    },
    {
      key: 'stock',
      label: 'Total Stock',
      sortable: true,
      render: (_, row) => {
        const totalStock = row.variants ? row.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 0;
        return (
          <span className={`font-bold ${totalStock > 5 ? 'text-emerald-700' : totalStock > 0 ? 'text-amber-700' : 'text-rose-600'}`}>
            {totalStock} pcs
          </span>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {val ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={11} /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <XCircle size={11} /> Draft
            </span>
          )}
          {row.isFeatured && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Star size={10} className="fill-amber-500 text-amber-500" /> Featured
            </span>
          )}
        </div>
      ),
    },
  ];

  // Actions with API integration
  const handleCreate = async (formData) => {
    try {
      const res = await productApi.create(formData);
      const newProduct = res.data || res.product || res;
      setProducts([newProduct, ...products]);
      setIsCreateOpen(false);
      toast.success(`Product "${newProduct.name || formData.get?.('name')}" added!`, {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
        iconTheme: { primary: '#c9a96e', secondary: '#fff' },
      });
    } catch (error) {
      toast.error(error.message || 'Failed to create product');
    }
  };

  const handleEdit = async (formData) => {
    try {
      const res = await productApi.update(editingItem._id, formData);
      const updated = res.data || res.product || { ...editingItem };
      setProducts((prev) =>
        prev.map((p) => (p._id === editingItem._id ? updated : p))
      );
      setEditingItem(null);
      toast.success(`Product updated!`, {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
        iconTheme: { primary: '#c9a96e', secondary: '#fff' },
      });
    } catch (error) {
      toast.error(error.message || 'Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product listing?')) {
      try {
        await productApi.delete(id);
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.error('Product deleted from inventory.', {
          style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
        });
      } catch (error) {
        toast.error(error.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      <AdminDataTable
        title="Products Inventory"
        subtitle="Manage product catalog, variants, pricing, and active listings"
        columns={columns}
        data={products}
        onView={(row) => setDetailItem(row)}
        onEdit={(row) => setEditingItem(row)}
        onDelete={handleDelete}
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Add Product"
        searchPlaceholder="Search product title, description, or ID..."
        filterOptions={[
          {
            key: 'isActive',
            label: 'Status',
            options: [
              { label: 'Active', value: true },
              { label: 'Draft', value: false },
            ],
          },
          {
            key: 'isFeatured',
            label: 'Featured',
            options: [
              { label: 'Featured Only', value: true },
              { label: 'Standard', value: false },
            ],
          },
        ]}
      />

      {/* Detail View Modal */}
      <AdminDetailView
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        title={detailItem?.name}
        type="product"
        data={detailItem}
      />

      {/* Create Modal */}
      <AdminFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Product"
        isEdit={false}
      >
        <ProductForm
          brands={brands}
          categories={categories}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
        />
      </AdminFormModal>

      {/* Edit Modal */}
      <AdminFormModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={`Edit Product: ${editingItem?.name}`}
        isEdit={true}
      >
        <ProductForm
          initialData={editingItem}
          brands={brands}
          categories={categories}
          onSubmit={handleEdit}
          onCancel={() => setEditingItem(null)}
        />
      </AdminFormModal>
    </div>
  );
}
