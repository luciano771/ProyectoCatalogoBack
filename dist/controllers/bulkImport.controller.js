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
exports.bulkImportHandler = exports.getTemplateHandler = void 0;
const bulkImportService = __importStar(require("../services/bulkImport.service"));
const errors_1 = require("../utils/errors");
const getTemplateHandler = async (_req, res) => {
    const buffer = bulkImportService.generateTemplateBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename="plantilla-productos.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
};
exports.getTemplateHandler = getTemplateHandler;
const bulkImportHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const file = req.file;
    if (!file || !file.buffer) {
        throw errors_1.AppError.validation('Debe adjuntar un archivo Excel');
    }
    const result = await bulkImportService.bulkImportProducts(req.auth.sub, {
        fileBuffer: file.buffer,
        fileName: file.originalname || 'import.xlsx',
        fileSize: file.size,
        storeFile: true
    });
    res.status(200).json(result);
};
exports.bulkImportHandler = bulkImportHandler;
