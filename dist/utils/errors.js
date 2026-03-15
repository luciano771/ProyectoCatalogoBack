"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
    static validation(message, details) {
        return new AppError(400, 'VALIDATION_ERROR', message, details);
    }
    static unauthorized(message = 'No autorizado') {
        return new AppError(401, 'UNAUTHORIZED', message);
    }
    static forbidden(message = 'Prohibido') {
        return new AppError(403, 'FORBIDDEN', message);
    }
    static notFound(message = 'No encontrado') {
        return new AppError(404, 'NOT_FOUND', message);
    }
    static conflict(message = 'Conflicto') {
        return new AppError(409, 'CONFLICT', message);
    }
    static internal(message = 'Error interno del servidor') {
        return new AppError(500, 'INTERNAL_SERVER_ERROR', message);
    }
}
exports.AppError = AppError;
