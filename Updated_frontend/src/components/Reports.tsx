import { useState, useEffect } from 'react';
import { BarChart3, PieChart, Download, Calendar, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Expense, Budget } from '../types';

const Reports = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedReport, setSelectedReport] = useState('expense-summary');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const savedBudgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    setExpenses(savedExpenses);
    setBudgets(savedBudgets);
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  const getExpensesByCategory = () => {
    const categoryData: { [key: string]: number } = {};
    filteredExpenses.forEach(expense => {
      if (expense.status === 'approved') {
        categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
      }
    });
    return Object.entries(categoryData).map(([category, amount]) => ({ category, amount }));
  };

  const getExpensesByStatus = () => {
    const statusData: { [key: string]: number } = {};
    filteredExpenses.forEach(expense => {
      statusData[expense.status] = (statusData[expense.status] || 0) + 1;
    });
    return Object.entries(statusData).map(([status, count]) => ({ status, count }));
  };

  const getMonthlyTrend = () => {
    const monthlyData: { [key: string]: number } = {};
    filteredExpenses.forEach(expense => {
      if (expense.status === 'approved') {
        const month = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
      }
    });
    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
  };

  const getTotalStats = () => {
    const approved = filteredExpenses.filter(e => e.status === 'approved');
    const pending = filteredExpenses.filter(e => e.status === 'pending');
    const rejected = filteredExpenses.filter(e => e.status === 'rejected');
    
    return {
      totalExpenses: filteredExpenses.length,
      totalAmount: approved.reduce((sum, e) => sum + e.amount, 0),
      averageExpense: approved.length > 0 ? approved.reduce((sum, e) => sum + e.amount, 0) / approved.length : 0,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length
    };
  };

  const exportReport = () => {
    const reportData = {
      reportType: selectedReport,
      dateRange,
      totalStats: getTotalStats(),
      expensesByCategory: getExpensesByCategory(),
      expensesByStatus: getExpensesByStatus(),
      monthlyTrend: getMonthlyTrend(),
      generatedAt: new Date().toISOString(),
      generatedBy: user?.name
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `expense-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const stats = getTotalStats();
  const categoryData = getExpensesByCategory();
  const statusData = getExpensesByStatus();
  const monthlyData = getMonthlyTrend();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
              <p className="text-gray-600 mt-1">Comprehensive insights into expense patterns and trends</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={exportReport}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Expenses</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalExpenses}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-green-900">${stats.totalAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Average Expense</p>
                  <p className="text-2xl font-bold text-purple-900">${stats.averageExpense.toFixed(0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pendingCount}</p>
                </div>
                <Filter className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expenses by Category */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Expenses by Category
              </h3>
              <div className="space-y-3">
                {categoryData.map((item, index) => {
                  const percentage = (item.amount / stats.totalAmount) * 100;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
                  
                  return (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded ${colors[index % colors.length]} mr-3`}></div>
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">${item.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expenses by Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Expenses by Status
              </h3>
              <div className="space-y-4">
                {statusData.map((item) => {
                  const percentage = (item.count / stats.totalExpenses) * 100;
                  
                  return (
                    <div key={item.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{item.count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.status === 'approved' ? 'bg-green-500' :
                            item.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          {monthlyData.length > 0 && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Monthly Spending Trend
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {monthlyData.map((item) => (
                  <div key={item.month} className="bg-white rounded-lg p-4 text-center">
                    <div className="text-sm font-medium text-gray-600">{item.month}</div>
                    <div className="text-lg font-bold text-gray-900">${item.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget vs Actual */}
          {budgets.length > 0 && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual Spending</h3>
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const utilizationPercentage = (budget.spent / budget.amount) * 100;
                  
                  return (
                    <div key={budget.id} className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{budget.name}</span>
                        <span className="text-sm text-gray-600">
                          ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            utilizationPercentage >= 90 ? 'bg-red-500' :
                            utilizationPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>{utilizationPercentage.toFixed(1)}% used</span>
                        <span>100%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;