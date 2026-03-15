import { Router } from 'express';
import {
  getMyMerchantProfileHandler,
  updateMyMerchantProfileHandler,
  uploadLogoHandler,
  uploadBannerHandler
} from '../controllers/merchant.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { asyncHandler } from '../utils/asyncHandler';

export const merchantRouter = Router();

merchantRouter.get(
  '/profile',
  requireAuth,
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(getMyMerchantProfileHandler)
);

merchantRouter.put(
  '/profile',
  requireAuth,
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(updateMyMerchantProfileHandler)
);

merchantRouter.post(
  '/profile/logo',
  requireAuth,
  requireRole('MERCHANT', 'ADMIN'),
  uploadImage,
  asyncHandler(uploadLogoHandler)
);

merchantRouter.post(
  '/profile/banner',
  requireAuth,
  requireRole('MERCHANT', 'ADMIN'),
  uploadImage,
  asyncHandler(uploadBannerHandler)
);

