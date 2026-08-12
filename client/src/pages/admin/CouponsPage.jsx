import React, { useState } from 'react';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminDetailView from '../../components/admin/AdminDetailView';
import AdminFormModal from '../../components/admin/AdminFormModal';
import CouponForm from '../../components/admin/forms/CouponForm';
import { CheckCircle2, XCircle, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import { couponApi } from '../../lib/api';

export default function CouponsPage({ coupons, setCoupons, products = [] }) {
  const [detailItem, setDetailItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Column definitions matching Coupon.js schema
  const columns = [
    {
      key: 'code',
      label: 'Coupon Code',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200/60 w-fit">
          <Ticket size={13} className="text-[#c9a96e]" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'discountValue',
      label: 'Discount Rate',
      sortable: true,
      render: (val, row) => (
        <span className="font-bold text-gray-900">
          {row.discountType === 'percentage' ? `${val}% OFF` : `PKR ${val} OFF`}
        </span>
      ),
    },
    {
      key: 'minimumPurchase',
      label: 'Min Spend',
      sortable: true,
      render: (val) => <span className="text-gray-600">PKR {val || 0}</span>,
    },
    {
      key: 'expiryDate',
      label: 'Validity',
      sortable: true,
      render: (val, row) => {
        const start = row.startDate ? new Date(row.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
        const end = val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        return <span className="text-gray-500 text-[11px] font-medium">{start} — {end}</span>;
      },
    },
    {
      key: 'usedCount',
      label: 'Usage',
      sortable: true,
      render: (val, row) => (
        <span className="text-gray-700 font-semibold">
          {val || 0} / {row.usageLimit ? row.usageLimit : '∞'}
        </span>
      ),
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
            <XCircle size={12} /> Expired / Inactive
          </span>
        ),
    },
  ];

  // Actions with API integration
  const handleCreate = async (formData) => {
    try {
      const res = await couponApi.create(formData);
      const newCoupon = res.coupon || res.data || res;
      setCoupons([newCoupon, ...coupons]);
      setIsCreateOpen(false);
      toast.success(`Coupon "${newCoupon.code || formData.code}" added successfully!`, {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
        iconTheme: { primary: '#c9a96e', secondary: '#fff' },
      });
    } catch (error) {
      toast.error(error.message || 'Failed to create coupon');
    }
  };

  const handleEdit = async (formData) => {
    try {
      const res = await couponApi.update(editingItem._id, formData);
      const updated = res.coupon || res.data || { ...editingItem, ...formData };
      setCoupons((prev) => prev.map((c) => (c._id === editingItem._id ? updated : c)));
      setEditingItem(null);
      toast.success('Coupon updated successfully!', {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
        iconTheme: { primary: '#c9a96e', secondary: '#fff' },
      });
    } catch (error) {
      toast.error(error.message || 'Failed to update coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponApi.delete(id);
        setCoupons((prev) => prev.filter((c) => c._id !== id));
        toast.error('Coupon code deleted.', {
          style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
        });
      } catch (error) {
        toast.error(error.message || 'Failed to delete coupon');
      }
    }
  };

  return (
    <div className="space-y-6">
      <AdminDataTable
        title="Promotional Coupons"
        subtitle="Manage discount vouchers, promotional codes, and cart conditions"
        columns={columns}
        data={coupons}
        onView={(row) => setDetailItem(row)}
        onEdit={(row) => setEditingItem(row)}
        onDelete={handleDelete}
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Add Coupon"
        searchPlaceholder="Search coupon code or description..."
        filterOptions={[
          {
            key: 'discountType',
            label: 'Type',
            options: [
              { label: 'Percentage (%)', value: 'percentage' },
              { label: 'Fixed Amount', value: 'fixed' },
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

      {/* Detail View Modal */}
      <AdminDetailView
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        title={`Coupon: ${detailItem?.code}`}
        type="coupon"
        data={detailItem}
      />

      {/* Create Modal */}
      <AdminFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Coupon"
        isEdit={false}
      >
        <CouponForm
          availableProducts={products}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
        />
      </AdminFormModal>

      {/* Edit Modal */}
      <AdminFormModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={`Edit Coupon Code: ${editingItem?.code}`}
        isEdit={true}
      >
        <CouponForm
          initialData={editingItem}
          availableProducts={products}
          onSubmit={handleEdit}
          onCancel={() => setEditingItem(null)}
        />
      </AdminFormModal>
    </div>
  );
}
