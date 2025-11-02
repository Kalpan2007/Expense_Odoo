import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Shield, Users, Percent, Settings } from 'lucide-react';
import { ApprovalRule } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';

const ApprovalRules = () => {
  const { user } = useAuth();
  const { getCompanyUsers } = useUsers();
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'sequential' as 'sequential' | 'percentage' | 'specific' | 'hybrid',
    amountThreshold: '',
    percentageThreshold: '',
    specificApprovers: [] as string[],
    sequentialApprovers: [] as string[],
    categories: [] as string[]
  });

  const companyUsers = getCompanyUsers();
  const managers = companyUsers.filter(u => u.role === 'manager' || u.role === 'admin');

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    const savedRules = JSON.parse(localStorage.getItem('approvalRules') || '[]');
    setRules(savedRules);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...(prev[name as keyof typeof prev] as string[]), value]
        : (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const ruleData = {
      ...formData,
      companyId: user.companyId,
      amountThreshold: formData.amountThreshold ? parseFloat(formData.amountThreshold) : undefined,
      percentageThreshold: formData.percentageThreshold ? parseFloat(formData.percentageThreshold) : undefined,
      isActive: true
    };

    if (editingRule) {
      const updatedRules = rules.map(r => 
        r.id === editingRule.id ? { ...r, ...ruleData } : r
      );
      setRules(updatedRules);
      localStorage.setItem('approvalRules', JSON.stringify(updatedRules));
      setEditingRule(null);
    } else {
      const newRule: ApprovalRule = {
        ...ruleData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      const updatedRules = [...rules, newRule];
      setRules(updatedRules);
      localStorage.setItem('approvalRules', JSON.stringify(updatedRules));
      setShowCreateModal(false);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'sequential',
      amountThreshold: '',
      percentageThreshold: '',
      specificApprovers: [],
      sequentialApprovers: [],
      categories: []
    });
  };

  const handleEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      amountThreshold: rule.amountThreshold?.toString() || '',
      percentageThreshold: rule.percentageThreshold?.toString() || '',
      specificApprovers: rule.specificApprovers || [],
      sequentialApprovers: rule.sequentialApprovers || [],
      categories: rule.categories || []
    });
  };

  const handleDelete = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this approval rule?')) {
      const updatedRules = rules.filter(r => r.id !== ruleId);
      setRules(updatedRules);
      localStorage.setItem('approvalRules', JSON.stringify(updatedRules));
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    const updatedRules = rules.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    );
    setRules(updatedRules);
    localStorage.setItem('approvalRules', JSON.stringify(updatedRules));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sequential': return <Users className="w-4 h-4" />;
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'specific': return <Shield className="w-4 h-4" />;
      case 'hybrid': return <Settings className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sequential': return 'bg-blue-100 text-blue-800';
      case 'percentage': return 'bg-green-100 text-green-800';
      case 'specific': return 'bg-purple-100 text-purple-800';
      case 'hybrid': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['Travel', 'Meals & Entertainment', 'Office Supplies', 'Transportation', 'Accommodation', 'Communication', 'Training', 'Marketing', 'Software', 'Other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Approval Rules</h2>
              <p className="text-gray-600 mt-1">Configure automated approval workflows and conditions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </button>
          </div>
        </div>

        {/* Rules List */}
        <div className="p-6">
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(rule.type)}`}>
                      {getTypeIcon(rule.type)}
                      <span className="ml-1 capitalize">{rule.type}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleRuleStatus(rule.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        rule.isActive 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {rule.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {rule.amountThreshold && (
                    <div>
                      <span className="font-medium text-gray-700">Amount Threshold:</span>
                      <span className="ml-2 text-gray-600">${rule.amountThreshold.toLocaleString()}</span>
                    </div>
                  )}
                  {rule.percentageThreshold && (
                    <div>
                      <span className="font-medium text-gray-700">Percentage Threshold:</span>
                      <span className="ml-2 text-gray-600">{rule.percentageThreshold}%</span>
                    </div>
                  )}
                  {rule.categories && rule.categories.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Categories:</span>
                      <span className="ml-2 text-gray-600">{rule.categories.join(', ')}</span>
                    </div>
                  )}
                </div>

                {(rule.specificApprovers?.length || rule.sequentialApprovers?.length) && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700 text-sm">Approvers:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(rule.specificApprovers || rule.sequentialApprovers || []).map((approverId, index) => {
                        const approver = companyUsers.find(u => u.id === approverId);
                        return approver ? (
                          <span key={approverId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {rule.type === 'sequential' && <span className="mr-1">{index + 1}.</span>}
                            {approver.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {rules.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No approval rules configured</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first approval rule
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Rule Modal */}
      {(showCreateModal || editingRule) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRule ? 'Edit Approval Rule' : 'Create New Approval Rule'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., High Value Expense Approval"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sequential">Sequential - Approvers in order</option>
                  <option value="percentage">Percentage - % of approvers must approve</option>
                  <option value="specific">Specific - Specific person must approve</option>
                  <option value="hybrid">Hybrid - Combination of rules</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Threshold (Optional)</label>
                <input
                  type="number"
                  name="amountThreshold"
                  value={formData.amountThreshold}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Rule applies to expenses above this amount</p>
              </div>

              {(formData.type === 'percentage' || formData.type === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage Threshold</label>
                  <input
                    type="number"
                    name="percentageThreshold"
                    value={formData.percentageThreshold}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage of approvers required to approve</p>
                </div>
              )}

              {(formData.type === 'sequential' || formData.type === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sequential Approvers</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {managers.map((manager) => (
                      <label key={manager.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.sequentialApprovers.includes(manager.id)}
                          onChange={(e) => handleMultiSelectChange('sequentialApprovers', manager.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{manager.name} ({manager.role})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(formData.type === 'specific' || formData.type === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specific Approvers</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {managers.map((manager) => (
                      <label key={manager.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.specificApprovers.includes(manager.id)}
                          onChange={(e) => handleMultiSelectChange('specificApprovers', manager.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{manager.name} ({manager.role})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories (Optional)</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={(e) => handleMultiSelectChange('categories', category, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all categories</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalRules;