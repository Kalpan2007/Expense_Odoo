import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { UserPlus } from 'lucide-react';

interface SignupPageProps {
  onToggleLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onToggleLogin }) => {
  const { signup } = useAuth();
  const { currencies } = useCurrency();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    country: '',
    currency: '',
  });
  const [countries, setCountries] = useState<Array<{ name: string; currency: string }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const data = await response.json();

      const countryList = data
        .map((country: any) => {
          const currencyCode = country.currencies ? Object.keys(country.currencies)[0] : '';
          return {
            name: country.name.common,
            currency: currencyCode,
          };
        })
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      setCountries(countryList);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([
        { name: 'United States', currency: 'USD' },
        { name: 'United Kingdom', currency: 'GBP' },
        { name: 'India', currency: 'INR' },
      ]);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    const country = countries.find((c) => c.name === selectedCountry);

    setFormData({
      ...formData,
      country: selectedCountry,
      currency: country?.currency || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.country || !formData.currency) {
      setError('Please select a country');
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.fullName, formData.country, formData.currency);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Start managing your expenses efficiently</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
            required
          />

          <Input
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            required
          />

          <Input
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create a strong password"
            required
          />

          <Select
            label="Country"
            value={formData.country}
            onChange={handleCountryChange}
            options={[
              { value: '', label: 'Select your country' },
              ...countries.map((c) => ({ value: c.name, label: c.name })),
            ]}
            required
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Default Currency:</strong> {formData.currency || 'Select a country first'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleLogin}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
