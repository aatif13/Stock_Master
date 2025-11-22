import express from 'express';
import {
  createTransfer,
  validateTransfer,
  getTransfers,
} from '../controllers/transferController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, transferSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(transferSchema), createTransfer);
router.put('/:id/validate', validateTransfer);
router.get('/', getTransfers);

export default router;

