export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR';

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'No autorizado'): AppError {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Prohibido'): AppError {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'No encontrado'): AppError {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'Conflicto'): AppError {
    return new AppError(409, 'CONFLICT', message);
  }

  static internal(message = 'Error interno del servidor'): AppError {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}

