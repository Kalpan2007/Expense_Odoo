import { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../hooks/useAuth';

const ExpenseHistory = () => {
  const { user } = useAuth();
  const { expenses, getUserExpenses, getTeamExpenses } = useExpenses();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);

  const allExpenses = user?.role === 'admin' 
    ? expenses 
    : user?.role === 'manager' 
    ? [...getUserExpenses(), ...getTeamExpenses()]
    : getUserExpenses();

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [allExpenses, searchTerm, statusFilter, categoryFilter]);

  const categories = Array.from(new Set(allExpenses.map(e => e.category)));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const selectedExpenseDetails = selectedExpense ? 
    allExpenses.find(e => e.id === selectedExpense) : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.role === 'employee' ? 'My Expenses' : 
                 user?.role === 'manager' ? 'Team Expenses' : 'All Expenses'}
              </h2>
              <p className="text-gray-600 mt-1">{filteredExpenses.length} expenses found</p>
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <div className="flex items-center">
              <Filter className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {filteredExpenses.length} of {allExpenses.length}
              </span>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="divide-y divide-gray-200">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                        {getStatusIcon(expense.status)}
                        <span className="ml-1 capitalize">{expense.status}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Amount:</span>
                        <span className="ml-2">${expense.amount.toLocaleString()} {expense.currency}</span>
                      </div>
                      <div>
                        <span className="font-medium">Employee:</span>
                        <span className="ml-2">{expense.employeeName}</span>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-2">{expense.category}</span>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <span className="ml-2">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedExpense(expense.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No expenses found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Expense Details Modal */}
      {selectedExpenseDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Expense Details</h3>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium">{selectedExpenseDetails.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">${selectedExpenseDetails.amount.toLocaleString()} {selectedExpenseDetails.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{selectedExpenseDetails.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(selectedExpenseDetails.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee:</span>
                      <span className="font-medium">{selectedExpenseDetails.employeeName}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Status & Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      {getStatusIcon(selectedExpenseDetails.status)}
                      <span className="ml-2 font-medium capitalize">{selectedExpenseDetails.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Created: {new Date(selectedExpenseDetails.createdAt).toLocaleString()}</div>
                      <div>Updated: {new Date(selectedExpenseDetails.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Flow */}
              {selectedExpenseDetails.approvalFlow.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Approval Flow</h4>
                  <div className="space-y-3">
                    {selectedExpenseDetails.approvalFlow.map((step, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {step.status === 'approved' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : step.status === 'rejected' ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          )}
                          <div className="ml-3">
                            <div className="font-medium">{step.approverName}</div>
                            <div className="text-sm text-gray-600">{step.approverRole}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium capitalize ${
                            step.status === 'approved' ? 'text-green-600' :
                            step.status === 'rejected' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {step.status}
                          </div>
                          {step.approvedAt && (
                            <div className="text-xs text-gray-500">
                              {new Date(step.approvedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {selectedExpenseDetails.approvalFlow.some(step => step.comment) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Comments</h4>
                  <div className="space-y-2">
                    {selectedExpenseDetails.approvalFlow
                      .filter(step => step.comment)
                      .map((step, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-sm">{step.approverName}</div>
                          <div className="text-sm text-gray-600 mt-1">{step.comment}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseHistory;