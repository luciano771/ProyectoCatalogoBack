"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const requireAuth = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        next(errors_1.AppError.unauthorized('Token no provisto'));
        return;
    }
    const token = authHeader.substring('Bearer '.length).trim();
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.auth = payload;
        next();
    }
    catch {
        next(errors_1.AppError.unauthorized('Token inválido o expirado'));
    }
};
exports.requireAuth = requireAuth;
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.auth) {
            next(errors_1.AppError.unauthorized('No autenticado'));
            return;
        }
        if (!roles.includes(req.auth.role)) {
            next(errors_1.AppError.forbidden('No tienes permisos para esta acción'));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
