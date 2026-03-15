"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const bulkImport_controller_1 = require("../controllers/bulkImport.controller");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const asyncHandler_1 = require("../utils/asyncHandler");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ok = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ].includes(file.mimetype) || /\.(xlsx|xls)$/i.test(file.originalname || '');
        if (ok) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
        }
    }
}).single('file');
exports.productRouter = (0, express_1.Router)();
exports.productRouter.get('/bulk-template', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('MERCHANT', 'ADMIN'), (0, asyncHandler_1.asyncHandler)(bulkImport_controller_1.getTemplateHandler));
exports.productRouter.post('/bulk-import', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('MERCHANT', 'ADMIN'), upload, (0, asyncHandler_1.asyncHandler)(bulkImport_controller_1.bulkImportHandler));
exports.productRouter.get('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('MERCHANT', 'ADMIN'), (0, asyncHandler_1.asyncHandler)(product_controller_1.listProductsHandler));
exports.productRouter.post('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('MERCHANT', 'ADMIN'), (0, asyncHandler_1.asyncHandler)(product_controller_1.createProductHandler));
exports.productRouter.put('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('MERCHANT', 'ADMIN'), (0, asyncHandler_1.asyncHandler)(product_controller_1.updateProductHandler));
exports.productRouter.post('/:id/image', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('MERCHANT', 'ADMIN'), upload_middleware_1.uploadImage, (0, asyncHandler_1.asyncHandler)(product_controller_1.uploadProductImageHandler));
exports.productRouter.delete('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('MERCHANT', 'ADMIN'), (0, asyncHandler_1.asyncHandler)(product_controller_1.deleteProductHandler));
