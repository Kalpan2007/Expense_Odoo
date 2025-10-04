import React from 'react';
import { Expense } from '../../types';

interface ExpenseStatusChartProps {
  expenses: Expense[];
}

export const ExpenseStatusChart: React.FC<ExpenseStatusChartProps> = ({ expenses }) => {
  const statusCounts = expenses.reduce((acc, expense) => {
    acc[expense.status] = (acc[expense.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = expenses.length;
  const pending = statusCounts.pending || 0;
  const approved = statusCounts.approved || 0;
  const rejected = statusCounts.rejected || 0;

  const data = [
    { status: 'Approved', count: approved, color: 'bg-green-500', percentage: total ? (approved / total) * 100 : 0 },
    { status: 'Pending', count: pending, color: 'bg-yellow-500', percentage: total ? (pending / total) * 100 : 0 },
    { status: 'Rejected', count: rejected, color: 'bg-red-500', percentage: total ? (rejected / total) * 100 : 0 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Expense Status Overview</h3>
      {total === 0 ? (
        <p className="text-gray-500 text-center py-8">No expenses submitted yet</p>
      ) : (
        <>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {data.map((item) => (
              item.count > 0 && (
                <div
                  key={item.status}
                  className={`${item.color} transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.status}: ${item.count}`}
                />
              )
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {data.map((item) => (
              <div key={item.status} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className={`w-3 h-3 rounded-full ${item.color} mr-2`} />
                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
