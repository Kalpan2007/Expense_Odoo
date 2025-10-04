export type UserRole = 'admin' | 'manager' | 'employee';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalRuleType = 'percentage' | 'specific_approver' | 'hybrid';

export interface Company {
  id: string;
  name: string;
  currency: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  companyId: string;
  email: string;
  fullName: string;
  role: UserRole;
  managerId?: string;
  isManagerApprover: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  currency: string;
  amountInCompanyCurrency: number;
  category: string;
  description: string;
  expenseDate: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  currentApproverStep: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRule {
  id: string;
  companyId: string;
  name: string;
  ruleType: ApprovalRuleType;
  percentageThreshold?: number;
  specificApproverId?: string;
  specificApproverName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApprovalWorkflow {
  id: string;
  companyId: string;
  expenseId: string;
  approverId: string;
  approverName: string;
  stepOrder: number;
  status: ExpenseStatus;
  comments?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRates {
  [currencyCode: string]: number;
}
