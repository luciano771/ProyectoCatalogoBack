"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const errorMiddleware = (err, _req, res, _next) => {
    if (err instanceof errors_1.AppError) {
        if (err.status >= 500) {
            logger_1.logger.error(`${err.code}: ${err.message}`, err);
        }
        res.status(err.status).json({
            message: err.message,
            code: err.code,
            details: err.details ?? null
        });
        return;
    }
    const msg = err instanceof Error ? err.message : '';
    const multerCode = err && typeof err === 'object' && 'code' in err ? err.code : undefined;
    if (multerCode === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: 'La imagen no puede superar 5 MB', code: 'VALIDATION_ERROR' });
        return;
    }
    if (msg && (msg.includes('Solo se permiten') || msg.includes('solo se permiten'))) {
        res.status(400).json({ message: msg, code: 'VALIDATION_ERROR' });
        return;
    }
    logger_1.logger.error(msg || 'Unexpected server error', err);
    res.status(500).json({
        message: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
    });
};
exports.errorMiddleware = errorMiddleware;
