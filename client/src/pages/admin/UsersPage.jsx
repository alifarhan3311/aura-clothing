import React, { useState } from 'react';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminDetailView from '../../components/admin/AdminDetailView';
import AdminFormModal from '../../components/admin/AdminFormModal';
import UserForm from '../../components/admin/forms/UserForm';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { showSuccess, showError, showDelete } from '../../lib/toastUtils';
import { userApi } from '../../lib/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD && import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000');

function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const cleanBase = BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export default function UsersPage({ users, setUsers }) {
  const [detailItem, setDetailItem] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      width: '70px',
      sortable: false,
      render: (val, row) => (
        <img
          src={
            val
              ? resolveImg(val)
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || 'U')}&background=c9a96e&color=111&bold=true&size=80`
          }
          alt={row.name}
          className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-xs"
        />
      ),
    },
    {
      key: 'name',
      label: 'Customer Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-gray-900">{val}</div>
          <div className="text-[11px] text-gray-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) =>
        val === 'admin' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/30 uppercase tracking-wider">
            <ShieldCheck size={12} /> Admin
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 uppercase tracking-wider">
            User
          </span>
        ),
    },
    {
      key: 'isVerified',
      label: 'Status',
      sortable: true,
      render: (val) =>
        val ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <UserCheck size={13} /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
            <UserX size={13} /> Pending
          </span>
        ),
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false,
      render: (val) => <span className="text-gray-600 text-xs">{val || '—'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
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
      const res = await userApi.create(formData);
      const newUser = res.user || res.data || res;
      setUsers([newUser, ...users]);
      setIsCreateOpen(false);
      showSuccess(`User "${newUser.name || formData.name}" registered successfully!`);
    } catch (error) {
      showError(error.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await userApi.delete(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showDelete('User account removed.');
    } catch (error) {
      showError(error.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <AdminDataTable
        title="User Management"
        subtitle="View registered customer details, roles, and verification status (Read-only for customer data)"
        columns={columns}
        data={users}
        onView={(row) => setDetailItem(row)}
        onDelete={handleDelete}
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Add User"
        searchPlaceholder="Search name, email, phone, or role..."
        filterOptions={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
            ],
          },
          {
            key: 'isVerified',
            label: 'Verification',
            options: [
              { label: 'Verified', value: true },
              { label: 'Unverified', value: false },
            ],
          },
        ]}
      />

      <AdminDetailView
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        title={`Customer Details: ${detailItem?.name}`}
        type="user"
        data={detailItem}
      />

      <AdminFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User Account"
        isEdit={false}
      >
        <UserForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
      </AdminFormModal>
    </div>
  );
}
