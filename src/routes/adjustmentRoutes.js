import express from 'express';
import {
  createAdjustment,
  getAdjustments,
} from '../controllers/adjustmentController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, adjustmentSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(adjustmentSchema), createAdjustment);
router.get('/', getAdjustments);

export default router;

