import express from 'express';
import { getLedger } from '../controllers/ledgerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getLedger);

export default router;

