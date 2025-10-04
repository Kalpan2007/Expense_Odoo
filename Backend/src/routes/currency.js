import express from 'express';
import { getExchangeRatesHandler, getCountries } from '../controllers/currencyController.js';

const router = express.Router();

router.get('/exchange-rates', getExchangeRatesHandler);
router.get('/countries', getCountries);

export default router;
