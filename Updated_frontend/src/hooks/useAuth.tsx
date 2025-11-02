import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Company } from '../types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, country: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedCompany = localStorage.getItem('currentCompany');
    
    if (savedUser && savedCompany) {
      setUser(JSON.parse(savedUser));
      setCompany(JSON.parse(savedCompany));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: User) => u.email === email);
    
    if (foundUser) {
      const companies = JSON.parse(localStorage.getItem('companies') || '[]');
      const userCompany = companies.find((c: Company) => c.id === foundUser.companyId);
      
      setUser(foundUser);
      setCompany(userCompany);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      localStorage.setItem('currentCompany', JSON.stringify(userCompany));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string, country: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const companies = JSON.parse(localStorage.getItem('companies') || '[]');
      
      // Check if user already exists
      if (users.some((u: User) => u.email === email)) {
        return false;
      }

      // Get country currency
      const countriesResponse = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countries = await countriesResponse.json();
      const selectedCountry = countries.find((c: any) => 
        c.name.common.toLowerCase() === country.toLowerCase() ||
        c.name.official.toLowerCase() === country.toLowerCase()
      );
      
      const currency = selectedCountry ? Object.keys(selectedCountry.currencies)[0] : 'USD';

      // Create company
      const companyId = crypto.randomUUID();
      const newCompany: Company = {
        id: companyId,
        name: `${name}'s Company`,
        currency,
        country,
        adminId: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };

      // Create admin user
      const newUser: User = {
        id: newCompany.adminId,
        email,
        name,
        role: 'admin',
        companyId,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      users.push(newUser);
      companies.push(newCompany);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('companies', JSON.stringify(companies));

      setUser(newUser);
      setCompany(newCompany);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('currentCompany', JSON.stringify(newCompany));

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCompany');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, company, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};