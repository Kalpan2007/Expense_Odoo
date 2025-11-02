import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ExpenseSubmission from './components/ExpenseSubmission';
import ExpenseApprovals from './components/ExpenseApprovals';
import ExpenseHistory from './components/ExpenseHistory';
import UserManagement from './components/UserManagement';
import BudgetManagement from './components/BudgetManagement';
import Reports from './components/Reports';
import Settings from './components/Settings';
import ApprovalRules from './components/ApprovalRules';
import Projects from './components/Projects';
import Departments from './components/Departments';
import Profile from './components/Profile';
import Notifications from './components/Notifications';

// Initialize demo data
const initializeDemoData = () => {
  const existingUsers = localStorage.getItem('users');
  if (!existingUsers) {
    const demoUsers = [
      {
        id: 'admin-1',
        email: 'admin@demo.com',
        name: 'Admin User',
        role: 'admin',
        companyId: 'company-1',
        department: 'Administration',
        employeeId: 'EMP001',
        phone: '+1-555-0101',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'manager-1',
        email: 'manager@demo.com',
        name: 'John Manager',
        role: 'manager',
        companyId: 'company-1',
        department: 'Sales',
        employeeId: 'EMP002',
        phone: '+1-555-0102',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'employee-1',
        email: 'employee@demo.com',
        name: 'Jane Employee',
        role: 'employee',
        companyId: 'company-1',
        managerId: 'manager-1',
        department: 'Sales',
        employeeId: 'EMP003',
        phone: '+1-555-0103',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    const demoCompany = {
      id: 'company-1',
      name: 'Demo Company Inc.',
      currency: 'USD',
      country: 'United States',
      adminId: 'admin-1',
      address: '123 Business St, New York, NY 10001',
      taxId: 'TAX123456789',
      settings: {
        expenseCategories: [
          'Travel', 'Meals & Entertainment', 'Office Supplies', 
          'Transportation', 'Accommodation', 'Communication', 
          'Training', 'Marketing', 'Software', 'Other'
        ],
        approvalThreshold: 500,
        requireReceipts: true,
        autoApprovalLimit: 100,
        fiscalYearStart: '2024-01-01'
      },
      createdAt: new Date().toISOString()
    };

    const demoBudgets = [
      {
        id: 'budget-1',
        companyId: 'company-1',
        name: 'Travel Budget 2024',
        amount: 50000,
        spent: 12500,
        category: 'Travel',
        period: 'yearly',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'budget-2',
        companyId: 'company-1',
        name: 'Office Supplies Q1',
        amount: 5000,
        spent: 2300,
        category: 'Office Supplies',
        period: 'quarterly',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    const demoProjects = [
      {
        id: 'project-1',
        name: 'Website Redesign',
        code: 'WEB-001',
        description: 'Complete website redesign project',
        budget: 25000,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'project-2',
        name: 'Mobile App Development',
        code: 'MOB-001',
        description: 'New mobile application development',
        budget: 50000,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    const demoDepartments = [
      {
        id: 'dept-1',
        name: 'Sales',
        managerId: 'manager-1',
        budget: 100000,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'dept-2',
        name: 'Marketing',
        budget: 75000,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'dept-3',
        name: 'Administration',
        budget: 50000,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    localStorage.setItem('users', JSON.stringify(demoUsers));
    localStorage.setItem('companies', JSON.stringify([demoCompany]));
    localStorage.setItem('expenses', JSON.stringify([]));
    localStorage.setItem('budgets', JSON.stringify(demoBudgets));
    localStorage.setItem('projects', JSON.stringify(demoProjects));
    localStorage.setItem('departments', JSON.stringify(demoDepartments));
    localStorage.setItem('notifications', JSON.stringify([]));
  }
};

const AppContent = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'submit-expense':
        return <ExpenseSubmission />;
      case 'expenses':
      case 'team-expenses':
      case 'all-expenses':
        return <ExpenseHistory />;
      case 'approvals':
        return <ExpenseApprovals />;
      case 'users':
        return <UserManagement />;
      case 'budgets':
        return <BudgetManagement />;
      case 'reports':
        return <Reports />;
      case 'approval-rules':
        return <ApprovalRules />;
      case 'projects':
        return <Projects />;
      case 'departments':
        return <Departments />;
      case 'profile':
        return <Profile />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  useEffect(() => {
    initializeDemoData();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;