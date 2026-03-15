"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.createPublicOrderSchema = exports.orderItemInputSchema = void 0;
const zod_1 = require("zod");
exports.orderItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'productId requerido'),
    quantity: zod_1.z
        .number()
        .int('La cantidad debe ser un entero')
        .min(1, 'La cantidad mínima es 1')
});
exports.createPublicOrderSchema = zod_1.z.object({
    buyer: zod_1.z.object({
        fullName: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
        phone: zod_1.z.string().min(6, 'El teléfono es inválido').max(20),
        email: zod_1.z
            .string()
            .email('Email inválido')
            .optional()
            .or(zod_1.z.literal('').transform(() => undefined))
    }),
    items: zod_1.z.array(exports.orderItemInputSchema).min(1, 'Debe haber al menos un ítem en el pedido')
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'PAID', 'CANCELLED', 'DELIVERED'])
});
