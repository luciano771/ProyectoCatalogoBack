import { Router } from 'express';
import { authRouter } from './auth.routes';
import { merchantRouter } from './merchant.routes';
import { publicRouter } from './public.routes';
import { orderRouter } from './order.routes';
import { categoryRouter } from './category.routes';
import { productRouter } from './product.routes';

export const router = Router();

router.get('/', (_req, res) => {
  res.json({
    message: 'API Catálogo WhatsApp',
    version: '0.1.0',
    endpoints: {
      health: 'GET /health',
      ping: 'GET /api/ping',
      auth: 'POST /api/auth/register, POST /api/auth/login, GET /api/auth/me',
      merchant: 'GET /api/merchant/profile, PUT /api/merchant/profile',
      public: 'GET /api/public/store/:slug, GET /api/public/store/:slug/catalog, GET/DELETE /api/public/store/:slug/cart, POST/PATCH/DELETE /api/public/store/:slug/cart/items, POST /api/public/store/:slug/orders',
      orders: 'GET /api/orders, GET /api/orders/:id, PATCH /api/orders/:id/status',
      categories: 'GET/POST/PUT/DELETE /api/categories',
      products: 'GET/POST/PUT/DELETE /api/products, GET /api/products/bulk-template, POST /api/products/bulk-import'
    }
  });
});

router.get('/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

router.use('/auth', authRouter);
router.use('/merchant', merchantRouter);
router.use('/public', publicRouter);
router.use('/orders', orderRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);

