"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemSchema = exports.addCartItemSchema = void 0;
const zod_1 = require("zod");
exports.addCartItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'productId requerido'),
    quantity: zod_1.z.number().int().min(1, 'Cantidad mínima 1')
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(0, 'Cantidad no puede ser negativa')
});
