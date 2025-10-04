import React from 'react';
import { Expense } from '../../types';

interface ExpenseChartProps {
  expenses: Expense[];
  currency: string;
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, currency }) => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (expense.status === 'approved') {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amountInCompanyCurrency;
    }
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(categoryTotals);
  const maxAmount = Math.max(...Object.values(categoryTotals), 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Expenses by Category</h3>
      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No approved expenses yet</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const amount = categoryTotals[category];
            const percentage = (amount / maxAmount) * 100;

            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {currency} {amount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
