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
exports.uploadProductImageHandler = exports.deleteProductHandler = exports.updateProductHandler = exports.createProductHandler = exports.listProductsHandler = void 0;
const product_dto_1 = require("../dtos/product.dto");
const productService = __importStar(require("../services/product.service"));
const uploadService = __importStar(require("../services/upload.service"));
const errors_1 = require("../utils/errors");
const listProductsHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const list = await productService.listProductsForMerchant(req.auth.sub);
    res.status(200).json({ products: list });
};
exports.listProductsHandler = listProductsHandler;
const createProductHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const parsed = product_dto_1.createProductSchema.safeParse(req.body);
    if (!parsed.success) {
        throw errors_1.AppError.validation('Datos inválidos', parsed.error.flatten());
    }
    const product = await productService.createProductForMerchant(req.auth.sub, parsed.data);
    res.status(201).json({ product });
};
exports.createProductHandler = createProductHandler;
const updateProductHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const id = req.params.id;
    if (!id)
        throw errors_1.AppError.validation('Id requerido');
    const parsed = product_dto_1.updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
        throw errors_1.AppError.validation('Datos inválidos', parsed.error.flatten());
    }
    const product = await productService.updateProductForMerchant(req.auth.sub, id, parsed.data);
    res.status(200).json({ product });
};
exports.updateProductHandler = updateProductHandler;
const deleteProductHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const id = req.params.id;
    if (!id)
        throw errors_1.AppError.validation('Id requerido');
    await productService.deleteProductForMerchant(req.auth.sub, id);
    res.status(200).json({ ok: true });
};
exports.deleteProductHandler = deleteProductHandler;
const uploadProductImageHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const productId = req.params.id;
    if (!productId)
        throw errors_1.AppError.validation('Id de producto requerido');
    const file = req.file;
    if (!file)
        throw errors_1.AppError.validation('Se requiere el archivo de imagen');
    if (!uploadService.isAllowedMime(file.mimetype)) {
        throw errors_1.AppError.validation('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
    }
    if (file.size > uploadService.getMaxSize()) {
        throw errors_1.AppError.validation('La imagen no puede superar 5 MB');
    }
    const list = await productService.listProductsForMerchant(req.auth.sub);
    const product = list.find(p => p.id === productId);
    if (!product)
        throw errors_1.AppError.notFound('Producto no encontrado');
    const { url } = await uploadService.saveImage(req.auth.sub, uploadService.getProductImageBasename(productId), file.buffer, file.mimetype);
    const updated = await productService.updateProductForMerchant(req.auth.sub, productId, {
        imageCoverUrl: url
    });
    res.status(200).json({ product: updated, url });
};
exports.uploadProductImageHandler = uploadProductImageHandler;
