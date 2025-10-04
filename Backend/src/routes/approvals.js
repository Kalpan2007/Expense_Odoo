import express from 'express';
import {
  getApprovalWorkflows,
  approveExpense,
  rejectExpense,
  getApprovalRules,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule
} from '../controllers/approvalController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/workflows', getApprovalWorkflows);
router.post('/expenses/:id/approve', authorize('manager', 'admin'), approveExpense);
router.post('/expenses/:id/reject', authorize('manager', 'admin'), rejectExpense);

router.get('/rules', getApprovalRules);
router.post('/rules', authorize('admin'), createApprovalRule);
router.put('/rules/:id', authorize('admin'), updateApprovalRule);
router.delete('/rules/:id', authorize('admin'), deleteApprovalRule);

export default router;
