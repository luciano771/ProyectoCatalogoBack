import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const isProd = env.NODE_ENV === 'production';

/**
 * Límite general para toda la API: reduce abuso y fuerza bruta en general.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isProd ? 200 : 1000,  // menos en prod
  message: { message: 'Demasiadas solicitudes, intentá más tarde.', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Límite estricto para login y registro: protege contra fuerza bruta.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isProd ? 10 : 50,    // pocos intentos por ventana
  message: { message: 'Demasiados intentos de acceso. Intentá en 15 minutos.', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false
});
