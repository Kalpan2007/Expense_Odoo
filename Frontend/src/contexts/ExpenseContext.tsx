import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, ApprovalWorkflow, ApprovalRule, User } from '../types';
import { useAuth } from './AuthContext';

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

  const refreshExpenses = () => {
    if (!user || !company) return;

    const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const companyExpenses = allExpenses.filter((e: Expense) => e.companyId === company.id);

    if (user.role === 'employee') {
      setExpenses(companyExpenses.filter((e: Expense) => e.employeeId === user.id));
    } else {
      setExpenses(companyExpenses);
    }
  };

  const loadApprovalWorkflows = () => {
    if (!company) return;

    const allWorkflows = JSON.parse(localStorage.getItem('approval_workflows') || '[]');
    const companyWorkflows = allWorkflows.filter((w: ApprovalWorkflow) => w.companyId === company.id);
    setApprovalWorkflows(companyWorkflows);
  };

  const loadApprovalRules = () => {
    if (!company) return;

    const allRules = JSON.parse(localStorage.getItem('approval_rules') || '[]');
    const companyRules = allRules.filter((r: ApprovalRule) => r.companyId === company.id);
    setApprovalRules(companyRules);
  };

  const createExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentApproverStep' | 'employeeName'>) => {
    if (!user || !company) return;

    setLoading(true);

    const newExpense: Expense = {
      ...expenseData,
      id: `expense_${Date.now()}`,
      status: 'pending',
      currentApproverStep: 1,
      employeeName: user.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    allExpenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(allExpenses));

    await createApprovalWorkflowForExpense(newExpense);

    refreshExpenses();
    loadApprovalWorkflows();
    setLoading(false);
  };

  const createApprovalWorkflowForExpense = async (expense: Expense) => {
    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
    const employee = allUsers.find((u: User) => u.id === expense.employeeId);

    const workflows: ApprovalWorkflow[] = [];
    let stepOrder = 1;

    if (employee?.isManagerApprover && employee.managerId) {
      const manager = allUsers.find((u: User) => u.id === employee.managerId);
      if (manager) {
        workflows.push({
          id: `workflow_${Date.now()}_${stepOrder}`,
          companyId: expense.companyId,
          expenseId: expense.id,
          approverId: manager.id,
          approverName: manager.fullName,
          stepOrder,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        stepOrder++;
      }
    }

    const managers = allUsers.filter((u: User) =>
      u.companyId === expense.companyId && u.role === 'manager' && u.id !== employee?.managerId
    );

    managers.forEach((manager: User) => {
      workflows.push({
        id: `workflow_${Date.now()}_${stepOrder}_${manager.id}`,
        companyId: expense.companyId,
        expenseId: expense.id,
        approverId: manager.id,
        approverName: manager.fullName,
        stepOrder,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    });

    const allWorkflows = JSON.parse(localStorage.getItem('approval_workflows') || '[]');
    workflows.forEach(w => allWorkflows.push(w));
    localStorage.setItem('approval_workflows', JSON.stringify(allWorkflows));
  };

  const updateExpenseStatus = async (expenseId: string, status: 'approved' | 'rejected', comments?: string) => {
    if (!user) return;

    setLoading(true);

    const allWorkflows = JSON.parse(localStorage.getItem('approval_workflows') || '[]');
    const expenseWorkflows = allWorkflows.filter((w: ApprovalWorkflow) => w.expenseId === expenseId);
    const currentWorkflow = expenseWorkflows.find((w: ApprovalWorkflow) =>
      w.approverId === user.id && w.status === 'pending'
    );

    if (currentWorkflow) {
      currentWorkflow.status = status;
      currentWorkflow.comments = comments;
      currentWorkflow.approvedAt = new Date().toISOString();

      const workflowIndex = allWorkflows.findIndex((w: ApprovalWorkflow) => w.id === currentWorkflow.id);
      allWorkflows[workflowIndex] = currentWorkflow;
      localStorage.setItem('approval_workflows', JSON.stringify(allWorkflows));
    }

    const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const expenseIndex = allExpenses.findIndex((e: Expense) => e.id === expenseId);

    if (expenseIndex !== -1) {
      if (status === 'rejected') {
        allExpenses[expenseIndex].status = 'rejected';
      } else {
        const pendingWorkflows = expenseWorkflows.filter((w: ApprovalWorkflow) => w.status === 'pending');

        if (pendingWorkflows.length <= 1) {
          const activeRules = approvalRules.filter(r => r.isActive);
          let approved = false;

          if (activeRules.length > 0) {
            for (const rule of activeRules) {
              if (rule.ruleType === 'specific_approver' && rule.specificApproverId === user.id) {
                approved = true;
                break;
              }

              if (rule.ruleType === 'percentage' && rule.percentageThreshold) {
                const approvedCount = expenseWorkflows.filter((w: ApprovalWorkflow) => w.status === 'approved').length;
                const totalCount = expenseWorkflows.length;
                const percentage = (approvedCount / totalCount) * 100;

                if (percentage >= rule.percentageThreshold) {
                  approved = true;
                  break;
                }
              }

              if (rule.ruleType === 'hybrid') {
                if (rule.specificApproverId === user.id) {
                  approved = true;
                  break;
                }

                if (rule.percentageThreshold) {
                  const approvedCount = expenseWorkflows.filter((w: ApprovalWorkflow) => w.status === 'approved').length;
                  const totalCount = expenseWorkflows.length;
                  const percentage = (approvedCount / totalCount) * 100;

                  if (percentage >= rule.percentageThreshold) {
                    approved = true;
                    break;
                  }
                }
              }
            }
          } else {
            approved = true;
          }

          allExpenses[expenseIndex].status = approved ? 'approved' : 'pending';
        } else {
          allExpenses[expenseIndex].currentApproverStep += 1;
        }
      }

      allExpenses[expenseIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('expenses', JSON.stringify(allExpenses));
    }

    refreshExpenses();
    loadApprovalWorkflows();
    setLoading(false);
  };

  const createApprovalRule = async (ruleData: Omit<ApprovalRule, 'id' | 'createdAt'>) => {
    const newRule: ApprovalRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const allRules = JSON.parse(localStorage.getItem('approval_rules') || '[]');
    allRules.push(newRule);
    localStorage.setItem('approval_rules', JSON.stringify(allRules));

    loadApprovalRules();
  };

  const updateApprovalRule = async (ruleId: string, updates: Partial<ApprovalRule>) => {
    const allRules = JSON.parse(localStorage.getItem('approval_rules') || '[]');
    const ruleIndex = allRules.findIndex((r: ApprovalRule) => r.id === ruleId);

    if (ruleIndex !== -1) {
      allRules[ruleIndex] = { ...allRules[ruleIndex], ...updates };
      localStorage.setItem('approval_rules', JSON.stringify(allRules));
      loadApprovalRules();
    }
  };

  const deleteApprovalRule = async (ruleId: string) => {
    const allRules = JSON.parse(localStorage.getItem('approval_rules') || '[]');
    const filteredRules = allRules.filter((r: ApprovalRule) => r.id !== ruleId);
    localStorage.setItem('approval_rules', JSON.stringify(filteredRules));
    loadApprovalRules();
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
