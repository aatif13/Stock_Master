import express from 'express';
import { handleChatMessage } from '../controllers/chatbotController.js';

const router = express.Router();

/**
 * POST /api/chatbot
 * Handle chatbot messages
 */
router.post('/', handleChatMessage);

export default router;
