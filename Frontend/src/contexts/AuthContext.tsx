import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Company } from '../types';
import { authAPI } from '../lib/api';

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
    const storedSession = localStorage.getItem('session');

    if (storedUser && storedCompany && storedSession) {
      setUser(JSON.parse(storedUser));
      setCompany(JSON.parse(storedCompany));
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      setUser(response.user);
      setCompany(response.company);

      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('company', JSON.stringify(response.company));
      localStorage.setItem('session', JSON.stringify(response.session));

      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email: string, password: string, fullName: string, country: string, currency: string) => {
    setLoading(true);

    try {
      const response = await authAPI.signup(email, password, fullName, country, currency);

      setUser(response.user);
      setCompany(response.company);

      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('company', JSON.stringify(response.company));
      localStorage.setItem('session', JSON.stringify(response.session));

      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    setUser(null);
    setCompany(null);
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('session');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
