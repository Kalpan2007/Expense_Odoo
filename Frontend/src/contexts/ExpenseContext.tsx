import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, ApprovalWorkflow, ApprovalRule } from '../types';
import { useAuth } from './AuthContext';
import { expenseAPI, approvalAPI } from '../lib/api';

interface ExpenseContextType {
  expenses: Expense[];
  approvalWorkflows: ApprovalWorkflow[];
  approvalRules: ApprovalRule[];
  loading: boolean;
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentApproverStep' | 'employeeName'>) => Promise<void>;
  updateExpenseStatus: (expenseId: string, status: 'approved' | 'rejected', comments?: string) => Promise<void>;
  createApprovalRule: (rule: Omit<ApprovalRule, 'id' | 'createdAt'>) => Promise<void>;
  updateApprovalRule: (ruleId: string, updates: Partial<ApprovalRule>) => Promise<void>;
  deleteApprovalRule: (ruleId: string) => Promise<void>;
  refreshExpenses: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within ExpenseProvider');
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const { user, company } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [approvalWorkflows, setApprovalWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && company) {
      refreshExpenses();
      loadApprovalRules();
      loadApprovalWorkflows();
    }
  }, [user, company]);

  const refreshExpenses = async () => {
    if (!user || !company) return;

    try {
      const data = await expenseAPI.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const loadApprovalWorkflows = async () => {
    if (!company) return;

    try {
      const data = await approvalAPI.getWorkflows();
      setApprovalWorkflows(data);
    } catch (error) {
      console.error('Failed to fetch approval workflows:', error);
    }
  };

  const loadApprovalRules = async () => {
    if (!company) return;

    try {
      const data = await approvalAPI.getRules();
      setApprovalRules(data);
    } catch (error) {
      console.error('Failed to fetch approval rules:', error);
    }
  };

  const createExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentApproverStep' | 'employeeName'>) => {
    if (!user || !company) return;

    setLoading(true);

    try {
      await expenseAPI.create(expenseData);
      await refreshExpenses();
      await loadApprovalWorkflows();
    } catch (error) {
      console.error('Failed to create expense:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateExpenseStatus = async (expenseId: string, status: 'approved' | 'rejected', comments?: string) => {
    if (!user) return;

    setLoading(true);

    try {
      if (status === 'approved') {
        await approvalAPI.approve(expenseId, comments);
      } else {
        await approvalAPI.reject(expenseId, comments);
      }

      await refreshExpenses();
      await loadApprovalWorkflows();
    } catch (error) {
      console.error('Failed to update expense status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createApprovalRule = async (ruleData: Omit<ApprovalRule, 'id' | 'createdAt'>) => {
    try {
      await approvalAPI.createRule(ruleData);
      await loadApprovalRules();
    } catch (error) {
      console.error('Failed to create approval rule:', error);
      throw error;
    }
  };

  const updateApprovalRule = async (ruleId: string, updates: Partial<ApprovalRule>) => {
    try {
      await approvalAPI.updateRule(ruleId, updates);
      await loadApprovalRules();
    } catch (error) {
      console.error('Failed to update approval rule:', error);
      throw error;
    }
  };

  const deleteApprovalRule = async (ruleId: string) => {
    try {
      await approvalAPI.deleteRule(ruleId);
      await loadApprovalRules();
    } catch (error) {
      console.error('Failed to delete approval rule:', error);
      throw error;
    }
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      approvalWorkflows,
      approvalRules,
      loading,
      createExpense,
      updateExpenseStatus,
      createApprovalRule,
      updateApprovalRule,
      deleteApprovalRule,
      refreshExpenses,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
