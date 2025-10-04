import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Company } from '../types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, country: string, currency: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedCompany = localStorage.getItem('company');

    if (storedUser && storedCompany) {
      setUser(JSON.parse(storedUser));
      setCompany(JSON.parse(storedCompany));
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);

    const users = JSON.parse(localStorage.getItem('all_users') || '[]');
    const foundUser = users.find((u: User) => u.email === email);

    if (!foundUser) {
      setLoading(false);
      throw new Error('Invalid credentials');
    }

    const companies = JSON.parse(localStorage.getItem('all_companies') || '[]');
    const userCompany = companies.find((c: Company) => c.id === foundUser.companyId);

    setUser(foundUser);
    setCompany(userCompany || null);

    localStorage.setItem('user', JSON.stringify(foundUser));
    localStorage.setItem('company', JSON.stringify(userCompany));

    setLoading(false);
  };

  const signup = async (email: string, password: string, fullName: string, country: string, currency: string) => {
    setLoading(true);

    const newCompany: Company = {
      id: `company_${Date.now()}`,
      name: `${fullName}'s Company`,
      currency,
      country,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newUser: User = {
      id: `user_${Date.now()}`,
      companyId: newCompany.id,
      email,
      fullName,
      role: 'admin',
      isManagerApprover: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
    const allCompanies = JSON.parse(localStorage.getItem('all_companies') || '[]');

    allUsers.push(newUser);
    allCompanies.push(newCompany);

    localStorage.setItem('all_users', JSON.stringify(allUsers));
    localStorage.setItem('all_companies', JSON.stringify(allCompanies));
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('company', JSON.stringify(newCompany));

    setUser(newUser);
    setCompany(newCompany);

    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('user');
    localStorage.removeItem('company');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };

    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
    const userIndex = allUsers.findIndex((u: User) => u.id === user.id);

    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('all_users', JSON.stringify(allUsers));
    }

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
