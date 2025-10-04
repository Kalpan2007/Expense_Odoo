import React from 'react';
import { Expense } from '../../types';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface ExpenseTableProps {
  expenses: Expense[];
  currency: string;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, currency }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'info';
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: (row: Expense) => new Date(row.expenseDate).toLocaleDateString(),
    },
    {
      header: 'Category',
      accessor: 'category' as keyof Expense,
    },
    {
      header: 'Description',
      accessor: 'description' as keyof Expense,
      className: 'max-w-xs truncate',
    },
    {
      header: 'Amount',
      accessor: (row: Expense) => (
        <div>
          <div className="font-semibold">
            {row.currency} {row.amount.toFixed(2)}
          </div>
          {row.currency !== currency && (
            <div className="text-xs text-gray-500">
              {currency} {row.amountInCompanyCurrency.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Expense) => (
        <Badge variant={getStatusVariant(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <Table
      data={[...expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
      columns={columns}
      emptyMessage="No expenses submitted yet"
    />
  );
};
