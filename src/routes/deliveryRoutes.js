import express from 'express';
import {
  createDelivery,
  validateDelivery,
  getDeliveries,
} from '../controllers/deliveryController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, deliverySchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(deliverySchema), createDelivery);
router.put('/:id/validate', validateDelivery);
router.get('/', getDeliveries);

export default router;

