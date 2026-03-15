"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100),
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(100)
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'La contraseña es requerida')
});
