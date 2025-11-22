import express from 'express';
import {
  register,
  login,
  sendOTP,
  resetPassword,
} from '../controllers/authController.js';
import {
  validate,
  registerSchema,
  loginSchema,
  sendOTPSchema,
  resetPasswordSchema,
} from '../utils/validators.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/send-otp', validate(sendOTPSchema), sendOTP);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;

