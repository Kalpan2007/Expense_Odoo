import { useState } from 'react';
import { 
  Home, 
  Receipt, 
  Users, 
  Settings, 
  CheckSquare, 
  BarChart3,
  Menu,
  X,
  DollarSign,
  FileText,
  Shield,
  Briefcase,
  Building,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ currentPage, onPageChange }: SidebarProps) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'manager', 'employee'] },
    { id: 'expenses', label: 'My Expenses', icon: Receipt, roles: ['employee'] },
    { id: 'submit-expense', label: 'Submit Expense', icon: Receipt, roles: ['employee'] },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, roles: ['manager', 'admin'] },
    { id: 'team-expenses', label: 'Team Expenses', icon: BarChart3, roles: ['manager'] },
    { id: 'all-expenses', label: 'All Expenses', icon: BarChart3, roles: ['admin'] },
    { id: 'budgets', label: 'Budget Management', icon: DollarSign, roles: ['admin', 'manager'] },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText, roles: ['admin', 'manager'] },
    { id: 'approval-rules', label: 'Approval Rules', icon: Shield, roles: ['admin'] },
    { id: 'projects', label: 'Projects', icon: Briefcase, roles: ['admin', 'manager'] },
    { id: 'departments', label: 'Departments', icon: Building, roles: ['admin'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'manager', 'employee'] },
    { id: 'profile', label: 'My Profile', icon: User, roles: ['admin', 'manager', 'employee'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'employee'] }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} border-r border-gray-200`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 font-bold text-gray-800 text-lg">ExpenseFlow</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="p-4 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-4 border-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-blue-700' : ''}`} />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;