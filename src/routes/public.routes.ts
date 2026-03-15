import { Router } from 'express';
import { getPublicMerchantProfileBySlugHandler } from '../controllers/merchant.controller';
import { createPublicOrderHandler } from '../controllers/order.controller';
import { getPublicCatalogHandler, getPublicProductHandler } from '../controllers/catalog.controller';
import {
  getCartHandler,
  addCartItemHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  clearCartHandler
} from '../controllers/cart.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const publicRouter = Router();

publicRouter.get('/store/:slug', asyncHandler(getPublicMerchantProfileBySlugHandler));
publicRouter.get('/store/:slug/catalog', asyncHandler(getPublicCatalogHandler));
publicRouter.get('/store/:slug/products/:productId', asyncHandler(getPublicProductHandler));
publicRouter.get('/store/:slug/cart', asyncHandler(getCartHandler));
publicRouter.post('/store/:slug/cart/items', asyncHandler(addCartItemHandler));
publicRouter.patch('/store/:slug/cart/items/:productId', asyncHandler(updateCartItemHandler));
publicRouter.delete('/store/:slug/cart/items/:productId', asyncHandler(removeCartItemHandler));
publicRouter.delete('/store/:slug/cart', asyncHandler(clearCartHandler));
publicRouter.post('/store/:slug/orders', asyncHandler(createPublicOrderHandler));

