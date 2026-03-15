"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Envuelve un handler async para que cualquier error (throw o rechazo de promesa)
 * se pase a next() y lo maneje el error middleware. Así el servidor no se cae.
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
