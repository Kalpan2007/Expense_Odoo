import { useState, useEffect } from 'react';
import { Expense, User, ApprovalStep } from '../types';
import { useAuth } from './useAuth';

export const useExpenses = () => {
  const { user, company } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    loadExpenses();
  }, [user]);

  const loadExpenses = () => {
    const savedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    setExpenses(savedExpenses);
  };

  const createExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'approvalFlow' | 'currentApproverIndex' | 'comments' | 'status'>) => {
    if (!user) return;

    // Get approval flow based on user's manager
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const manager = user.managerId ? users.find((u: User) => u.id === user.managerId) : null;
    
    const approvalFlow: ApprovalStep[] = [];
    
    if (manager) {
      approvalFlow.push({
        approverId: manager.id,
        approverName: manager.name,
        approverRole: manager.role,
        status: 'pending'
      });
    }

    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      status: 'pending',
      approvalFlow,
      currentApproverIndex: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const approveExpense = (expenseId: string, comment?: string) => {
    if (!user) return;

    const updatedExpenses = expenses.map(expense => {
      if (expense.id === expenseId && expense.currentApproverIndex < expense.approvalFlow.length) {
        const updatedFlow = [...expense.approvalFlow];
        updatedFlow[expense.currentApproverIndex] = {
          ...updatedFlow[expense.currentApproverIndex],
          status: 'approved',
          comment,
          approvedAt: new Date().toISOString()
        };

        const isLastApprover = expense.currentApproverIndex === expense.approvalFlow.length - 1;
        
        return {
          ...expense,
          approvalFlow: updatedFlow,
          currentApproverIndex: isLastApprover ? expense.currentApproverIndex : expense.currentApproverIndex + 1,
          status: isLastApprover ? 'approved' : 'pending',
          updatedAt: new Date().toISOString()
        };
      }
      return expense;
    });

    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const rejectExpense = (expenseId: string, comment: string) => {
    if (!user) return;

    const updatedExpenses = expenses.map(expense => {
      if (expense.id === expenseId) {
        const updatedFlow = [...expense.approvalFlow];
        updatedFlow[expense.currentApproverIndex] = {
          ...updatedFlow[expense.currentApproverIndex],
          status: 'rejected',
          comment,
          approvedAt: new Date().toISOString()
        };

        return {
          ...expense,
          approvalFlow: updatedFlow,
          status: 'rejected',
          updatedAt: new Date().toISOString()
        };
      }
      return expense;
    });

    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const getUserExpenses = (userId?: string) => {
    const targetUserId = userId || user?.id;
    return expenses.filter(expense => expense.employeeId === targetUserId);
  };

  const getPendingExpenses = () => {
    if (!user) return [];
    
    return expenses.filter(expense => 
      expense.status === 'pending' && 
      expense.currentApproverIndex < expense.approvalFlow.length &&
      expense.approvalFlow[expense.currentApproverIndex]?.approverId === user.id
    );
  };

  const getTeamExpenses = () => {
    if (!user || user.role === 'employee') return [];
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teamMembers = users.filter((u: User) => u.managerId === user.id);
    
    return expenses.filter(expense => 
      teamMembers.some((member: User) => member.id === expense.employeeId)
    );
  };

  return {
    expenses,
    createExpense,
    approveExpense,
    rejectExpense,
    getUserExpenses,
    getPendingExpenses,
    getTeamExpenses,
    loadExpenses
  };
};