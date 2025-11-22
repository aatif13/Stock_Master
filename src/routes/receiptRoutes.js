import express from 'express';
import {
  createReceipt,
  validateReceipt,
  getReceipts,
} from '../controllers/receiptController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, receiptSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(receiptSchema), createReceipt);
router.put('/:id/validate', validateReceipt);
router.get('/', getReceipts);

export default router;

