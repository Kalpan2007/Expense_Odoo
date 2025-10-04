import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { UserPlus, CreditCard as Edit2 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user: currentUser, company } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    managerId: '',
    isManagerApprover: false,
  });

  useEffect(() => {
    loadUsers();
  }, [company]);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
    const companyUsers = allUsers.filter((u: User) => u.companyId === company?.id);
    setUsers(companyUsers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
      const userIndex = allUsers.findIndex((u: User) => u.id === editingUser.id);

      if (userIndex !== -1) {
        allUsers[userIndex] = {
          ...editingUser,
          ...formData,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('all_users', JSON.stringify(allUsers));
      }
    } else {
      const newUser: User = {
        id: `user_${Date.now()}`,
        companyId: company?.id || '',
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        managerId: formData.managerId || undefined,
        isManagerApprover: formData.isManagerApprover,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
      allUsers.push(newUser);
      localStorage.setItem('all_users', JSON.stringify(allUsers));
    }

    loadUsers();
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      email: '',
      fullName: '',
      role: 'employee',
      managerId: '',
      isManagerApprover: false,
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      managerId: user.managerId || '',
      isManagerApprover: user.isManagerApprover,
    });
    setIsModalOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'info';
      case 'employee':
        return 'success';
      default:
        return 'info';
    }
  };

  const managers = users.filter((u) => u.role === 'manager');

  const columns = [
    {
      header: 'Name',
      accessor: 'fullName' as keyof User,
    },
    {
      header: 'Email',
      accessor: 'email' as keyof User,
    },
    {
      header: 'Role',
      accessor: (row: User) => (
        <Badge variant={getRoleBadgeVariant(row.role)}>
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Manager',
      accessor: (row: User) => {
        if (!row.managerId) return '-';
        const manager = users.find((u) => u.id === row.managerId);
        return manager?.fullName || '-';
      },
    },
    {
      header: 'Manager Approver',
      accessor: (row: User) => (row.isManagerApprover ? 'Yes' : 'No'),
    },
    {
      header: 'Actions',
      accessor: (row: User) => (
        <Button size="sm" variant="secondary" onClick={() => handleEdit(row)}>
          <Edit2 size={14} />
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <UserPlus className="mr-2" size={18} />
          Add User
        </Button>
      </div>

      <Table data={users} columns={columns} emptyMessage="No users found" />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          setFormData({
            email: '',
            fullName: '',
            role: 'employee',
            managerId: '',
            isManagerApprover: false,
          });
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={!!editingUser}
          />

          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            options={[
              { value: 'employee', label: 'Employee' },
              { value: 'manager', label: 'Manager' },
              { value: 'admin', label: 'Admin' },
            ]}
            required
          />

          {formData.role === 'employee' && (
            <>
              <Select
                label="Manager"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                options={[
                  { value: '', label: 'No manager' },
                  ...managers.map((m) => ({ value: m.id, label: m.fullName })),
                ]}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isManagerApprover"
                  checked={formData.isManagerApprover}
                  onChange={(e) => setFormData({ ...formData, isManagerApprover: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isManagerApprover" className="text-sm font-medium text-gray-700">
                  Require manager approval
                </label>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
