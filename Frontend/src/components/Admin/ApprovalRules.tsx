import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';
import { User, ApprovalRule } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { Plus, Trash2, CreditCard as Edit2 } from 'lucide-react';

export const ApprovalRules: React.FC = () => {
  const { company } = useAuth();
  const { approvalRules, createApprovalRule, updateApprovalRule, deleteApprovalRule } = useExpense();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'percentage' as 'percentage' | 'specific_approver' | 'hybrid',
    percentageThreshold: 60,
    specificApproverId: '',
    isActive: true,
  });

  const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]').filter(
    (u: User) => u.companyId === company?.id && (u.role === 'manager' || u.role === 'admin')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRule) {
      await updateApprovalRule(editingRule.id, {
        ...formData,
        companyId: company?.id || '',
      });
    } else {
      await createApprovalRule({
        ...formData,
        companyId: company?.id || '',
      });
    }

    setIsModalOpen(false);
    setEditingRule(null);
    setFormData({
      name: '',
      ruleType: 'percentage',
      percentageThreshold: 60,
      specificApproverId: '',
      isActive: true,
    });
  };

  const handleEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      ruleType: rule.ruleType,
      percentageThreshold: rule.percentageThreshold || 60,
      specificApproverId: rule.specificApproverId || '',
      isActive: rule.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this approval rule?')) {
      await deleteApprovalRule(ruleId);
    }
  };

  const handleToggleActive = async (rule: ApprovalRule) => {
    await updateApprovalRule(rule.id, {
      isActive: !rule.isActive,
    });
  };

  const getRuleDescription = (rule: ApprovalRule) => {
    switch (rule.ruleType) {
      case 'percentage':
        return `${rule.percentageThreshold}% of approvers must approve`;
      case 'specific_approver':
        return `${rule.specificApproverName || 'Specific approver'} approval auto-approves`;
      case 'hybrid':
        return `${rule.percentageThreshold}% OR ${rule.specificApproverName || 'specific approver'} approval`;
      default:
        return '';
    }
  };

  const columns = [
    {
      header: 'Rule Name',
      accessor: 'name' as keyof ApprovalRule,
    },
    {
      header: 'Type',
      accessor: (row: ApprovalRule) => (
        <Badge variant="info">
          {row.ruleType.replace('_', ' ').charAt(0).toUpperCase() + row.ruleType.slice(1).replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Description',
      accessor: (row: ApprovalRule) => getRuleDescription(row),
    },
    {
      header: 'Status',
      accessor: (row: ApprovalRule) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: ApprovalRule) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={row.isActive ? 'danger' : 'success'}
            onClick={() => handleToggleActive(row)}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleEdit(row)}>
            <Edit2 size={14} />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">About Approval Rules</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Percentage Rule:</strong> Requires a percentage of approvers to approve</li>
            <li>• <strong>Specific Approver:</strong> Approval from a specific person auto-approves</li>
            <li>• <strong>Hybrid Rule:</strong> Combines both percentage and specific approver</li>
          </ul>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2" size={18} />
          Add Approval Rule
        </Button>
      </div>

      <Table data={approvalRules} columns={columns} emptyMessage="No approval rules configured" />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
          setFormData({
            name: '',
            ruleType: 'percentage',
            percentageThreshold: 60,
            specificApproverId: '',
            isActive: true,
          });
        }}
        title={editingRule ? 'Edit Approval Rule' : 'Create Approval Rule'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Rule Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., CFO Auto-Approval"
            required
          />

          <Select
            label="Rule Type"
            value={formData.ruleType}
            onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as any })}
            options={[
              { value: 'percentage', label: 'Percentage Rule' },
              { value: 'specific_approver', label: 'Specific Approver' },
              { value: 'hybrid', label: 'Hybrid Rule' },
            ]}
            required
          />

          {(formData.ruleType === 'percentage' || formData.ruleType === 'hybrid') && (
            <Input
              type="number"
              label="Percentage Threshold"
              value={formData.percentageThreshold}
              onChange={(e) => setFormData({ ...formData, percentageThreshold: parseInt(e.target.value) })}
              min={1}
              max={100}
              required
            />
          )}

          {(formData.ruleType === 'specific_approver' || formData.ruleType === 'hybrid') && (
            <Select
              label="Specific Approver"
              value={formData.specificApproverId}
              onChange={(e) => setFormData({ ...formData, specificApproverId: e.target.value })}
              options={[
                { value: '', label: 'Select approver' },
                ...allUsers.map((u: User) => ({ value: u.id, label: `${u.fullName} (${u.role})` })),
              ]}
              required
            />
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
