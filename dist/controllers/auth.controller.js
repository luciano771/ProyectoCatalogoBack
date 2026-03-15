"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeHandler = exports.loginHandler = exports.registerMerchantHandler = void 0;
const auth_dto_1 = require("../dtos/auth.dto");
const authService = __importStar(require("../services/auth.service"));
const errors_1 = require("../utils/errors");
const registerMerchantHandler = async (req, res) => {
    const parseResult = auth_dto_1.registerSchema.safeParse(req.body);
    if (!parseResult.success) {
        throw errors_1.AppError.validation('Datos de registro inválidos', parseResult.error.flatten());
    }
    const data = await authService.registerMerchant(parseResult.data);
    res.status(201).json(data);
};
exports.registerMerchantHandler = registerMerchantHandler;
const loginHandler = async (req, res) => {
    const parseResult = auth_dto_1.loginSchema.safeParse(req.body);
    if (!parseResult.success) {
        throw errors_1.AppError.validation('Datos de login inválidos', parseResult.error.flatten());
    }
    const data = await authService.login(parseResult.data);
    res.status(200).json(data);
};
exports.loginHandler = loginHandler;
const getMeHandler = async (req, res) => {
    if (!req.auth) {
        throw errors_1.AppError.unauthorized('No autenticado');
    }
    const user = await authService.getCurrentUser(req.auth.sub);
    res.status(200).json({ user });
};
exports.getMeHandler = getMeHandler;
