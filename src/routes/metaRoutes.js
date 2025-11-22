import express from 'express';
import {
  getCategories,
  getWarehouses,
  getLocations,
} from '../controllers/metaController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/categories', getCategories);
router.get('/warehouses', getWarehouses);
router.get('/locations', getLocations);

export default router;

