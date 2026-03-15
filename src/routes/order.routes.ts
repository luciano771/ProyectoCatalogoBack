import { Router } from 'express';
import {
  listMerchantOrdersHandler,
  getMerchantOrderDetailHandler,
  updateMerchantOrderStatusHandler
} from '../controllers/order.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

export const orderRouter = Router();

orderRouter.get(
  '/',
  requireAuth,
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(listMerchantOrdersHandler)
);

orderRouter.get(
  '/:id',
  requireAuth,
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(getMerchantOrderDetailHandler)
);

orderRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(updateMerchantOrderStatusHandler)
);

