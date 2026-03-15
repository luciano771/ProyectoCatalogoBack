import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/errors';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: JwtPayload;
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next(AppError.unauthorized('Token no provisto'));
    return;
  }

  const token = authHeader.substring('Bearer '.length).trim();
  try {
    const payload = verifyToken(token);
    req.auth = payload;
    next();
  } catch {
    next(AppError.unauthorized('Token inválido o expirado'));
  }
};

export const requireRole = (...roles: Array<'MERCHANT' | 'ADMIN'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(AppError.unauthorized('No autenticado'));
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(AppError.forbidden('No tienes permisos para esta acción'));
      return;
    }
    next();
  };
};

