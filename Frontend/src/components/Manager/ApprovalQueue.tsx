import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';
import { Expense } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

export const ApprovalQueue: React.FC = () => {
  const { user, company } = useAuth();
  const { expenses, approvalWorkflows, updateExpenseStatus } = useExpense();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const pendingApprovals = approvalWorkflows.filter(
    (w) => w.approverId === user?.id && w.status === 'pending'
  );

  const pendingExpenses = expenses.filter((e) =>
    pendingApprovals.some((w) => w.expenseId === e.id)
  );

  const handleApprove = async (expenseId: string) => {
    setLoading(true);
    await updateExpenseStatus(expenseId, 'approved', comments);
    setComments('');
    setSelectedExpense(null);
    setLoading(false);
  };

  const handleReject = async (expenseId: string) => {
    setLoading(true);
    await updateExpenseStatus(expenseId, 'rejected', comments);
    setComments('');
    setSelectedExpense(null);
    setLoading(false);
  };

  if (pendingExpenses.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
        <p className="text-gray-600 text-lg">All caught up! No pending approvals.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pendingExpenses.map((expense) => {
          const workflow = pendingApprovals.find((w) => w.expenseId === expense.id);

          return (
            <div
              key={expense.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{expense.category}</h4>
                    <Badge variant="warning">Step {workflow?.stepOrder}</Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{expense.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Employee:</span>
                      <p className="font-medium text-gray-900">{expense.employeeName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <p className="font-medium text-gray-900">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </p>
                      {expense.currency !== company?.currency && (
                        <p className="text-xs text-gray-500">
                          {company?.currency} {expense.amountInCompanyCurrency.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleApprove(expense.id)}
                    disabled={loading}
                  >
                    <CheckCircle size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleReject(expense.id)}
                    disabled={loading}
                  >
                    <XCircle size={16} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!selectedExpense}
        onClose={() => {
          setSelectedExpense(null);
          setComments('');
        }}
        title="Review Expense"
        size="lg"
      >
        {selectedExpense && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Employee</label>
                <p className="text-gray-900 font-semibold">{selectedExpense.employeeName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-gray-900 font-semibold">{selectedExpense.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="text-gray-900 font-semibold">
                  {selectedExpense.currency} {selectedExpense.amount.toFixed(2)}
                </p>
                {selectedExpense.currency !== company?.currency && (
                  <p className="text-sm text-gray-500">
                    {company?.currency} {selectedExpense.amountInCompanyCurrency.toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date</label>
                <p className="text-gray-900 font-semibold">
                  {new Date(selectedExpense.expenseDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="text-gray-900 mt-1">{selectedExpense.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add comments..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="success"
                className="flex-1"
                onClick={() => handleApprove(selectedExpense.id)}
                disabled={loading}
              >
                <CheckCircle className="mr-2" size={20} />
                Approve
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => handleReject(selectedExpense.id)}
                disabled={loading}
              >
                <XCircle className="mr-2" size={20} />
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
