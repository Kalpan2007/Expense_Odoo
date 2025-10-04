import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, ExchangeRates } from '../types';

interface CurrencyContextType {
  currencies: Currency[];
  exchangeRates: ExchangeRates;
  loading: boolean;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number;
  fetchExchangeRates: (baseCurrency: string) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countries = await response.json();

      const currencyMap = new Map<string, Currency>();

      countries.forEach((country: any) => {
        if (country.currencies) {
          Object.entries(country.currencies).forEach(([code, details]: [string, any]) => {
            if (!currencyMap.has(code)) {
              currencyMap.set(code, {
                code,
                name: details.name,
                symbol: details.symbol || code,
              });
            }
          });
        }
      });

      setCurrencies(Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code)));
    } catch (error) {
      console.error('Error fetching currencies:', error);
      setCurrencies([
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      ]);
    }
  };

  const fetchExchangeRates = async (baseCurrency: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      const data = await response.json();
      setExchangeRates(data.rates || {});
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setExchangeRates({
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        INR: 74.5,
      });
    } finally {
      setLoading(false);
    }
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;

    if (Object.keys(exchangeRates).length === 0) {
      return amount;
    }

    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;

    const amountInBase = amount / fromRate;
    return amountInBase * toRate;
  };

  return (
    <CurrencyContext.Provider value={{ currencies, exchangeRates, loading, convertCurrency, fetchExchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  );
};
