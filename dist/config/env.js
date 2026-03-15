"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const getEnv = (key, fallback) => {
    const value = process.env[key];
    if (value === undefined || value === '') {
        if (fallback !== undefined)
            return fallback;
        throw new Error(`Falta la variable de entorno: ${key}. Definila en .env (ver .env.example).`);
    }
    return value;
};
exports.env = {
    NODE_ENV: getEnv('NODE_ENV', 'development'),
    PORT: Number(getEnv('PORT', '4000')),
    DATABASE_URL: getEnv('DATABASE_URL'),
    CORS_ORIGIN: getEnv('CORS_ORIGIN', 'http://localhost:5173'),
    JWT_SECRET: getEnv('JWT_SECRET'),
    JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),
    UPLOAD_DIR: getEnv('UPLOAD_DIR', 'uploads')
};
