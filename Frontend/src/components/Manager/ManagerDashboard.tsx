import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';
import { Card } from '../ui/Card';
import { ApprovalQueue } from './ApprovalQueue';
import { ExpenseChart } from '../Charts/ExpenseChart';
import { ExpenseStatusChart } from '../Charts/ExpenseStatusChart';
import { CheckSquare, Clock, TrendingUp } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { user, company } = useAuth();
  const { expenses, approvalWorkflows } = useExpense();

  const pendingApprovals = approvalWorkflows.filter(
    (w) => w.approverId === user?.id && w.status === 'pending'
  );

  const allPendingExpenses = expenses.filter((e) => e.status === 'pending');
  const approvedExpenses = expenses.filter((e) => e.status === 'approved');

  const totalApproved = approvedExpenses.reduce((sum, e) => sum + e.amountInCompanyCurrency, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-1">Review and approve team expense claims</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingApprovals.length}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting your review</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">All Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{allPendingExpenses.length}</p>
              <p className="text-xs text-gray-500 mt-1">Team-wide</p>
            </div>
            <CheckSquare className="text-blue-500" size={32} />
          </div>
        </Card>

        <Card className="border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {company?.currency} {totalApproved.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{approvedExpenses.length} expenses</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </Card>
      </div>

      <Card title="Approval Queue">
        <ApprovalQueue />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Expense Categories">
          <ExpenseChart expenses={expenses} currency={company?.currency || 'USD'} />
        </Card>

        <Card title="Status Overview">
          <ExpenseStatusChart expenses={expenses} />
        </Card>
      </div>
    </div>
  );
};
