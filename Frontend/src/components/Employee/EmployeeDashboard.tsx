import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseTable } from './ExpenseTable';
import { ExpenseStatusChart } from '../Charts/ExpenseStatusChart';
import { PlusCircle, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user, company } = useAuth();
  const { expenses, refreshExpenses } = useExpense();
  const { fetchExchangeRates } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (company) {
      fetchExchangeRates(company.currency);
    }
  }, [company]);

  const userExpenses = expenses.filter((e) => e.employeeId === user?.id);
  const approvedExpenses = userExpenses.filter((e) => e.status === 'approved');
  const pendingExpenses = userExpenses.filter((e) => e.status === 'pending');
  const rejectedExpenses = userExpenses.filter((e) => e.status === 'rejected');

  const totalApproved = approvedExpenses.reduce((sum, e) => sum + e.amountInCompanyCurrency, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
          <p className="text-gray-600 mt-1">Submit and track your expense claims</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2" size={20} />
          Submit Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{userExpenses.length}</p>
            </div>
            <DollarSign className="text-blue-500" size={32} />
          </div>
        </Card>

        <Card className="border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{approvedExpenses.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {company?.currency} {totalApproved.toFixed(2)}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingExpenses.length}</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </Card>

        <Card className="border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{rejectedExpenses.length}</p>
            </div>
            <XCircle className="text-red-500" size={32} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Expense History">
          <ExpenseTable expenses={userExpenses} currency={company?.currency || 'USD'} />
        </Card>

        <Card title="Status Overview">
          <ExpenseStatusChart expenses={userExpenses} />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit New Expense"
        size="lg"
      >
        <ExpenseForm
          onSuccess={() => {
            setIsModalOpen(false);
            refreshExpenses();
          }}
        />
      </Modal>
    </div>
  );
};
