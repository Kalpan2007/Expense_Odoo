import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { LoginPage } from './components/Auth/LoginPage';
import { SignupPage } from './components/Auth/SignupPage';
import { Layout } from './components/Layout/Layout';
import { EmployeeDashboard } from './components/Employee/EmployeeDashboard';
import { ManagerDashboard } from './components/Manager/ManagerDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showSignup ? (
      <SignupPage onToggleLogin={() => setShowSignup(false)} />
    ) : (
      <LoginPage onToggleSignup={() => setShowSignup(true)} />
    );
  }

  return (
    <Layout>
      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'manager' && <ManagerDashboard />}
      {user.role === 'employee' && <EmployeeDashboard />}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ExpenseProvider>
          <AppContent />
        </ExpenseProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
