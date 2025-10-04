import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Upload, Camera } from 'lucide-react';

interface ExpenseFormProps {
  onSuccess: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess }) => {
  const { user, company } = useAuth();
  const { createExpense } = useExpense();
  const { currencies, convertCurrency, exchangeRates } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: company?.currency || 'USD',
    category: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  const categories = [
    { value: '', label: 'Select category' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Meals', label: 'Meals & Entertainment' },
    { value: 'Office Supplies', label: 'Office Supplies' },
    { value: 'Software', label: 'Software & Subscriptions' },
    { value: 'Training', label: 'Training & Education' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !company) return;

    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      const amountInCompanyCurrency = convertCurrency(amount, formData.currency, company.currency);

      await createExpense({
        companyId: company.id,
        employeeId: user.id,
        amount,
        currency: formData.currency,
        amountInCompanyCurrency,
        category: formData.category,
        description: formData.description,
        expenseDate: formData.expenseDate,
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOCRScan = () => {
    const mockOCRData = {
      amount: (Math.random() * 500 + 50).toFixed(2),
      category: 'Meals',
      description: 'Business lunch at restaurant',
      expenseDate: new Date().toISOString().split('T')[0],
    };

    setFormData({
      ...formData,
      ...mockOCRData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">OCR Receipt Scanner</h4>
          <Camera className="text-blue-600" size={20} />
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Upload a receipt to automatically extract expense details
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={handleOCRScan}>
          <Upload className="mr-2" size={16} />
          Scan Receipt (Demo)
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          step="0.01"
          label="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
          required
        />

        <Select
          label="Currency"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          options={[
            { value: '', label: 'Select currency' },
            ...currencies.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` })),
          ]}
          required
        />
      </div>

      {formData.amount && formData.currency !== company?.currency && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <strong>Converted Amount:</strong> {company?.currency}{' '}
            {convertCurrency(parseFloat(formData.amount || '0'), formData.currency, company?.currency || 'USD').toFixed(2)}
          </p>
        </div>
      )}

      <Select
        label="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        options={categories}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Describe the expense..."
          required
        />
      </div>

      <Input
        type="date"
        label="Expense Date"
        value={formData.expenseDate}
        onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
        required
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Expense'}
        </Button>
      </div>
    </form>
  );
};
