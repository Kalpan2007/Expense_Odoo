import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserManagement } from './UserManagement';
import { ApprovalRules } from './ApprovalRules';
import { ExpenseChart } from '../Charts/ExpenseChart';
import { ExpenseStatusChart } from '../Charts/ExpenseStatusChart';
import { Users, Settings, TrendingUp, DollarSign } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { company } = useAuth();
  const { expenses } = useExpense();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rules'>('overview');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountInCompanyCurrency, 0);
  const approvedExpenses = expenses.filter((e) => e.status === 'approved');
  const totalApproved = approvedExpenses.reduce((sum, e) => sum + e.amountInCompanyCurrency, 0);

  const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]').filter(
    (u: any) => u.companyId === company?.id
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage users, configure approval rules, and oversee all expenses</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="inline mr-2" size={18} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="inline mr-2" size={18} />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'rules'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="inline mr-2" size={18} />
          Approval Rules
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{allUsers.length}</p>
                </div>
                <Users className="text-blue-500" size={32} />
              </div>
            </Card>

            <Card className="border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{expenses.length}</p>
                </div>
                <DollarSign className="text-green-500" size={32} />
              </div>
            </Card>

            <Card className="border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {company?.currency} {totalExpenses.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="text-yellow-500" size={32} />
              </div>
            </Card>

            <Card className="border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Total</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {company?.currency} {totalApproved.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="text-purple-500" size={32} />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Expense Categories">
              <ExpenseChart expenses={expenses} currency={company?.currency || 'USD'} />
            </Card>

            <Card title="Status Overview">
              <ExpenseStatusChart expenses={expenses} />
            </Card>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <Card title="User Management">
          <UserManagement />
        </Card>
      )}

      {activeTab === 'rules' && (
        <Card title="Approval Rules Configuration">
          <ApprovalRules />
        </Card>
      )}
    </div>
  );
};
