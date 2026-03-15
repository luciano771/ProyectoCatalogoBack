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
exports.deleteCategoryHandler = exports.updateCategoryHandler = exports.createCategoryHandler = exports.listCategoriesHandler = void 0;
const category_dto_1 = require("../dtos/category.dto");
const categoryService = __importStar(require("../services/category.service"));
const errors_1 = require("../utils/errors");
const listCategoriesHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const list = await categoryService.listCategoriesForMerchant(req.auth.sub);
    res.status(200).json({ categories: list });
};
exports.listCategoriesHandler = listCategoriesHandler;
const createCategoryHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const parsed = category_dto_1.createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
        throw errors_1.AppError.validation('Datos inválidos', parsed.error.flatten());
    }
    const category = await categoryService.createCategoryForMerchant(req.auth.sub, parsed.data);
    res.status(201).json({ category });
};
exports.createCategoryHandler = createCategoryHandler;
const updateCategoryHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const id = req.params.id;
    if (!id)
        throw errors_1.AppError.validation('Id requerido');
    const parsed = category_dto_1.updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
        throw errors_1.AppError.validation('Datos inválidos', parsed.error.flatten());
    }
    const category = await categoryService.updateCategoryForMerchant(req.auth.sub, id, parsed.data);
    res.status(200).json({ category });
};
exports.updateCategoryHandler = updateCategoryHandler;
const deleteCategoryHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const id = req.params.id;
    if (!id)
        throw errors_1.AppError.validation('Id requerido');
    await categoryService.deleteCategoryForMerchant(req.auth.sub, id);
    res.status(200).json({ ok: true });
};
exports.deleteCategoryHandler = deleteCategoryHandler;
