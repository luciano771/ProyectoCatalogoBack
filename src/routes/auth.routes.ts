import { Router } from 'express';
import {
  registerMerchantHandler,
  loginHandler,
  getMeHandler
} from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, asyncHandler(registerMerchantHandler));
authRouter.post('/login', authRateLimiter, asyncHandler(loginHandler));
authRouter.get('/me', requireAuth, asyncHandler(getMeHandler));

