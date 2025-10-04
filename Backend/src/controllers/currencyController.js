import { getExchangeRates, getCountriesWithCurrencies } from '../utils/currency.js';

export async function getExchangeRatesHandler(req, res) {
  try {
    const { baseCurrency } = req.query;

    if (!baseCurrency) {
      return res.status(400).json({ error: 'Base currency is required' });
    }

    const rates = await getExchangeRates(baseCurrency);

    return res.status(200).json({
      base: baseCurrency,
      rates
    });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    return res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
}

export async function getCountries(req, res) {
  try {
    const countries = await getCountriesWithCurrencies();

    return res.status(200).json(countries);
  } catch (error) {
    console.error('Get countries error:', error);
    return res.status(500).json({ error: 'Failed to fetch countries' });
  }
}
