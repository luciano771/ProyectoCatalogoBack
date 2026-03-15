import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import * as errorLogService from '../services/errorLog.service';

function getUserId(req: Request): string | null {
  const auth = (req as Request & { auth?: { sub?: string } }).auth;
  return auth?.sub ?? null;
}

function getComponent(req: Request): string {
  const path = req.path || req.url || '';
  const method = req.method || '';
  return method && path ? `${method} ${path}` : path || 'unknown';
}

async function saveErrorLog(
  req: Request,
  key: string,
  message: string
): Promise<void> {
  await errorLogService.logError({
    key,
    component: getComponent(req),
    message,
    userId: getUserId(req)
  });
}

export const errorMiddleware = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger.error(`${err.code}: ${err.message}`, err);
    }
    await saveErrorLog(req, err.code, err.message);
    res.status(err.status).json({
      message: err.message,
      code: err.code,
      details: err.details ?? null
    });
    return;
  }

  const msg = err instanceof Error ? err.message : String(err);
  const multerCode = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : undefined;
  if (multerCode === 'LIMIT_FILE_SIZE') {
    await saveErrorLog(req, 'VALIDATION_ERROR', 'LIMIT_FILE_SIZE: La imagen no puede superar 5 MB');
    res.status(400).json({ message: 'La imagen no puede superar 5 MB', code: 'VALIDATION_ERROR' });
    return;
  }
  if (msg && (msg.includes('Solo se permiten') || msg.includes('solo se permiten'))) {
    await saveErrorLog(req, 'VALIDATION_ERROR', msg);
    res.status(400).json({ message: msg, code: 'VALIDATION_ERROR' });
    return;
  }

  logger.error(msg || 'Unexpected server error', err);
  const fullMessage = err instanceof Error && err.stack ? err.stack : msg || 'Unexpected server error';
  await saveErrorLog(req, 'INTERNAL_SERVER_ERROR', fullMessage);
  res.status(500).json({
    message: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR'
  });
};

