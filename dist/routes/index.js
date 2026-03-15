"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./auth.routes");
const merchant_routes_1 = require("./merchant.routes");
const public_routes_1 = require("./public.routes");
const order_routes_1 = require("./order.routes");
const category_routes_1 = require("./category.routes");
const product_routes_1 = require("./product.routes");
exports.router = (0, express_1.Router)();
exports.router.get('/', (_req, res) => {
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
exports.router.get('/ping', (_req, res) => {
    res.json({ message: 'pong' });
});
exports.router.use('/auth', auth_routes_1.authRouter);
exports.router.use('/merchant', merchant_routes_1.merchantRouter);
exports.router.use('/public', public_routes_1.publicRouter);
exports.router.use('/orders', order_routes_1.orderRouter);
exports.router.use('/categories', category_routes_1.categoryRouter);
exports.router.use('/products', product_routes_1.productRouter);
