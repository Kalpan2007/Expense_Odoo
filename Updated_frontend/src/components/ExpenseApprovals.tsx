import { useState } from 'react';
import { CheckCircle, XCircle, Clock, MessageCircle, DollarSign } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';

const ExpenseApprovals = () => {
  const { getPendingExpenses, approveExpense, rejectExpense } = useExpenses();
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const pendingExpenses = getPendingExpenses();

  const handleAction = (expenseId: string, actionType: 'approve' | 'reject') => {
    setSelectedExpense(expenseId);
    setAction(actionType);
  };

  const confirmAction = () => {
    if (!selectedExpense || !action) return;

    if (action === 'approve') {
      approveExpense(selectedExpense, comment);
    } else {
      rejectExpense(selectedExpense, comment);
    }

    setSelectedExpense(null);
    setAction(null);
    setComment('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
          <p className="text-gray-600 mt-1">{pendingExpenses.length} expenses waiting for your approval</p>
        </div>

        <div className="divide-y divide-gray-200">
          {pendingExpenses.length > 0 ? (
            pendingExpenses.map((expense) => (
              <div key={expense.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="font-medium">${expense.amount.toLocaleString()} {expense.currency}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">Employee:</span>
                        <span className="ml-2">{expense.employeeName}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">Category:</span>
                        <span className="ml-2">{expense.category}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">Date:</span>
                        <span className="ml-2">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Approval Flow */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Flow:</h4>
                      <div className="flex items-center space-x-2">
                        {expense.approvalFlow.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                              step.status === 'approved' ? 'bg-green-100 text-green-800' :
                              step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              index === expense.currentApproverIndex ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {step.status === 'approved' ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : step.status === 'rejected' ? (
                                <XCircle className="w-3 h-3 mr-1" />
                              ) : index === expense.currentApproverIndex ? (
                                <Clock className="w-3 h-3 mr-1" />
                              ) : null}
                              <span>{step.approverName} ({step.approverRole})</span>
                            </div>
                            {index < expense.approvalFlow.length - 1 && (
                              <div className="w-4 h-px bg-gray-300"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAction(expense.id, 'approve')}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(expense.id, 'reject')}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No expenses pending approval</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedExpense && action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {action === 'approve' ? 'Approve Expense' : 'Reject Expense'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Comment {action === 'reject' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={`Add a ${action === 'approve' ? 'note' : 'reason'} for this ${action}al...`}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmAction}
                disabled={action === 'reject' && !comment.trim()}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
              <button
                onClick={() => {
                  setSelectedExpense(null);
                  setAction(null);
                  setComment('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseApprovals;