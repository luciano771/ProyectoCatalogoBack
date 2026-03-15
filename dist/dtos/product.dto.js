"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nombre requerido').max(200),
    marca: zod_1.z.string().max(100).optional().nullable(),
    modelo: zod_1.z.string().max(100).optional().nullable(),
    description: zod_1.z.string().max(2000).optional(),
    price: zod_1.z.number().positive('Precio debe ser mayor a 0'),
    categoryId: zod_1.z.string().optional().nullable(),
    imageCoverUrl: zod_1.z
        .string()
        .max(2000)
        .optional()
        .nullable()
        .refine(v => !v || v === '' || v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'), { message: 'Debe ser una URL o ruta válida' })
        .or(zod_1.z.literal('')),
    stock: zod_1.z.number().int().min(0).optional().nullable(),
    active: zod_1.z.boolean().optional()
});
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200).optional(),
    marca: zod_1.z.string().max(100).optional().nullable(),
    modelo: zod_1.z.string().max(100).optional().nullable(),
    description: zod_1.z.string().max(2000).optional().nullable(),
    price: zod_1.z.number().positive().optional(),
    categoryId: zod_1.z.string().optional().nullable(),
    imageCoverUrl: zod_1.z
        .string()
        .max(2000)
        .optional()
        .nullable()
        .refine(v => !v || v === '' || v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'), { message: 'Debe ser una URL o ruta válida' })
        .or(zod_1.z.literal('')),
    stock: zod_1.z.number().int().min(0).optional().nullable(),
    active: zod_1.z.boolean().optional()
});
