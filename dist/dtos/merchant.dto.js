"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicMerchantProfileSchema = exports.updateMerchantProfileSchema = exports.merchantProfileBaseSchema = void 0;
const zod_1 = require("zod");
exports.merchantProfileBaseSchema = zod_1.z.object({
    businessName: zod_1.z
        .string()
        .min(2, 'El nombre del negocio debe tener al menos 2 caracteres')
        .max(150),
    slug: zod_1.z
        .string()
        .min(3, 'El slug debe tener al menos 3 caracteres')
        .max(100)
        .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener minúsculas, números y guiones'),
    description: zod_1.z
        .string()
        .max(500, 'La descripción no puede superar 500 caracteres')
        .nullable()
        .optional(),
    logoUrl: zod_1.z
        .string()
        .max(3000000, 'Imagen de logo demasiado grande')
        .nullable()
        .optional(),
    bannerUrl: zod_1.z
        .string()
        .max(3000000, 'Imagen de banner demasiado grande')
        .nullable()
        .optional(),
    instagramUrl: zod_1.z
        .string()
        .url('URL de Instagram inválida')
        .nullable()
        .optional(),
    paymentAlias: zod_1.z
        .string()
        .max(100, 'Alias de pago demasiado largo')
        .nullable()
        .optional(),
    active: zod_1.z.boolean(),
    backgroundColor: zod_1.z
        .string()
        .max(20, 'Color inválido')
        .nullable()
        .optional(),
    themeId: zod_1.z
        .string()
        .max(50, 'Tema inválido')
        .nullable()
        .optional()
});
exports.updateMerchantProfileSchema = exports.merchantProfileBaseSchema.partial().refine(data => Object.keys(data).length > 0, {
    message: 'Debe enviarse al menos un campo para actualizar'
});
exports.publicMerchantProfileSchema = zod_1.z.object({
    businessName: zod_1.z.string(),
    slug: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    logoUrl: zod_1.z.string().nullable().optional(),
    bannerUrl: zod_1.z.string().nullable().optional(),
    instagramUrl: zod_1.z.string().nullable().optional(),
    paymentAlias: zod_1.z.string().nullable().optional(),
    active: zod_1.z.boolean(),
    backgroundColor: zod_1.z.string().nullable().optional(),
    themeId: zod_1.z.string().nullable().optional()
});
