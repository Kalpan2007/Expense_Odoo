import { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from './useAuth';

export const useUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(savedUsers);
  };

  const createUser = (userData: Omit<User, 'id' | 'createdAt' | 'companyId'>) => {
    if (!user) return;

    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      companyId: user.companyId,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const getCompanyUsers = () => {
    return users.filter(u => u.companyId === user?.companyId);
  };

  const getManagers = () => {
    return users.filter(u => u.companyId === user?.companyId && u.role === 'manager');
  };

  return {
    users,
    createUser,
    updateUser,
    deleteUser,
    getCompanyUsers,
    getManagers,
    loadUsers
  };
};