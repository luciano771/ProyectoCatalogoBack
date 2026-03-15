"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.apiRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
const isProd = env_1.env.NODE_ENV === 'production';
/**
 * Límite general para toda la API: reduce abuso y fuerza bruta en general.
 */
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isProd ? 200 : 1000, // menos en prod
    message: { message: 'Demasiadas solicitudes, intentá más tarde.', code: 'RATE_LIMIT' },
    standardHeaders: true,
    legacyHeaders: false
});
/**
 * Límite estricto para login y registro: protege contra fuerza bruta.
 */
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isProd ? 10 : 50, // pocos intentos por ventana
    message: { message: 'Demasiados intentos de acceso. Intentá en 15 minutos.', code: 'RATE_LIMIT' },
    standardHeaders: true,
    legacyHeaders: false
});
