import { useAuth } from '../hooks/useAuth';
import { useExpenses } from '../hooks/useExpenses';
import { useUsers } from '../hooks/useUsers';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  Receipt,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { expenses, getUserExpenses, getPendingExpenses, getTeamExpenses } = useExpenses();
  const { getCompanyUsers } = useUsers();

  const userExpenses = getUserExpenses();
  const pendingExpenses = getPendingExpenses();
  const teamExpenses = getTeamExpenses();
  const companyUsers = getCompanyUsers();

  const getStats = () => {
    switch (user?.role) {
      case 'admin':
        return [
          {
            title: 'Total Expenses',
            value: expenses.length,
            icon: Receipt,
            color: 'bg-blue-500',
            change: '+12%'
          },
          {
            title: 'Pending Approvals',
            value: expenses.filter(e => e.status === 'pending').length,
            icon: Clock,
            color: 'bg-yellow-500',
            change: '-5%'
          },
          {
            title: 'Total Users',
            value: companyUsers.length,
            icon: Users,
            color: 'bg-green-500',
            change: '+8%'
          },
          {
            title: 'Total Amount',
            value: `$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-purple-500',
            change: '+15%'
          }
        ];

      case 'manager':
        return [
          {
            title: 'Team Expenses',
            value: teamExpenses.length,
            icon: Receipt,
            color: 'bg-blue-500',
            change: '+8%'
          },
          {
            title: 'Pending Approvals',
            value: pendingExpenses.length,
            icon: Clock,
            color: 'bg-yellow-500',
            change: '-2%'
          },
          {
            title: 'Approved This Month',
            value: teamExpenses.filter(e => e.status === 'approved').length,
            icon: CheckCircle,
            color: 'bg-green-500',
            change: '+10%'
          },
          {
            title: 'Team Amount',
            value: `$${teamExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-purple-500',
            change: '+12%'
          }
        ];

      default: // employee
        return [
          {
            title: 'My Expenses',
            value: userExpenses.length,
            icon: Receipt,
            color: 'bg-blue-500',
            change: '+3%'
          },
          {
            title: 'Pending',
            value: userExpenses.filter(e => e.status === 'pending').length,
            icon: Clock,
            color: 'bg-yellow-500',
            change: '0%'
          },
          {
            title: 'Approved',
            value: userExpenses.filter(e => e.status === 'approved').length,
            icon: CheckCircle,
            color: 'bg-green-500',
            change: '+5%'
          },
          {
            title: 'Total Amount',
            value: `$${userExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-purple-500',
            change: '+18%'
          }
        ];
    }
  };

  const stats = getStats();

  const recentExpenses = user?.role === 'employee' 
    ? userExpenses.slice(0, 5)
    : user?.role === 'manager'
    ? teamExpenses.slice(0, 5)
    : expenses.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                  {stat.change}
                </span>
                <span className="text-gray-600 text-sm ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => (
              <div key={expense.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    expense.status === 'approved' ? 'bg-green-100' :
                    expense.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {expense.status === 'approved' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : expense.status === 'rejected' ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-600">{expense.employeeName} • {expense.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${expense.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No expenses found</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {user?.role === 'employee' && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <p className="text-blue-100 mb-4">Submit a new expense or check your pending approvals</p>
          <div className="flex space-x-4">
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
              Submit Expense
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
              View History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;