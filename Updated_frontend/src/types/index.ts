export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  managerId?: string;
  companyId: string;
  department?: string;
  employeeId?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  currency: string;
  country: string;
  adminId: string;
  logo?: string;
  address?: string;
  taxId?: string;
  settings: CompanySettings;
  createdAt: string;
}

export interface CompanySettings {
  expenseCategories: string[];
  approvalThreshold: number;
  requireReceipts: boolean;
  autoApprovalLimit: number;
  fiscalYearStart: string;
}

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  receiptUrl?: string;
  receiptData?: ReceiptData;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  approvalFlow: ApprovalStep[];
  currentApproverIndex: number;
  comments: Comment[];
  tags: string[];
  project?: string;
  billable: boolean;
  mileage?: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptData {
  vendor: string;
  total: number;
  date: string;
  items: ReceiptItem[];
  taxAmount?: number;
}

export interface ReceiptItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface ApprovalStep {
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  approvedAt?: string;
  order: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface ApprovalRule {
  id: string;
  companyId: string;
  name: string;
  type: 'sequential' | 'percentage' | 'specific' | 'hybrid';
  amountThreshold?: number;
  percentageThreshold?: number;
  specificApprovers?: string[];
  sequentialApprovers?: string[];
  categories?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  companyId: string;
  name: string;
  amount: number;
  spent: number;
  category?: string;
  department?: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'expense' | 'budget' | 'user' | 'approval';
  filters: ReportFilters;
  data: any[];
  generatedAt: string;
  generatedBy: string;
}

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  categories?: string[];
  users?: string[];
  status?: string[];
  departments?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'expense_submitted' | 'expense_approved' | 'expense_rejected' | 'budget_exceeded' | 'approval_required';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate?: number;
}

export interface Country {
  name: string;
  currencies: Record<string, Currency>;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  budget?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  budget?: number;
  isActive: boolean;
  createdAt: string;
}