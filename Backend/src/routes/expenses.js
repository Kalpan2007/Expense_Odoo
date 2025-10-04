import express from 'express';
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  scanReceipt
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllExpenses);
router.post('/', createExpense);
router.put('/:id', authorize('employee', 'admin'), updateExpense);
router.delete('/:id', authorize('employee', 'admin'), deleteExpense);
router.post('/scan-receipt', upload.single('receipt'), scanReceipt);

export default router;
