import axios from 'axios';

const EXCHANGE_RATE_API_URL = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest';

const exchangeRateCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000;

export async function getExchangeRates(baseCurrency) {
  const cacheKey = baseCurrency.toUpperCase();
  const cached = exchangeRateCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.rates;
  }

  try {
    const response = await axios.get(`${EXCHANGE_RATE_API_URL}/${baseCurrency}`);
    const rates = response.data.rates;

    exchangeRateCache.set(cacheKey, {
      rates,
      timestamp: Date.now()
    });

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw new Error('Failed to fetch exchange rates');
  }
}

export async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = await getExchangeRates(fromCurrency);
  const rate = rates[toCurrency];

  if (!rate) {
    throw new Error(`Exchange rate not found for ${toCurrency}`);
  }

  return amount * rate;
}

export async function getCountriesWithCurrencies() {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw new Error('Failed to fetch countries data');
  }
}
