import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface ErrorLogInput {
  key: string;
  component: string;
  message: string;
  userId?: string | null;
}

/**
 * Registra un error en la tabla ErrorLog.
 * No lanza excepciones: si falla el guardado, solo se registra en consola.
 */
export async function logError(input: ErrorLogInput): Promise<void> {
  try {
    await prisma.errorLog.create({
      data: {
        key: input.key,
        component: input.component,
        message: input.message.slice(0, 50_000),
        userId: input.userId ?? null
      }
    });
  } catch (e) {
    logger.error('No se pudo guardar ErrorLog', e);
  }
}
