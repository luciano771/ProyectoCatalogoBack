"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nombre requerido').max(100),
    sortOrder: zod_1.z.number().int().optional()
});
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    isActive: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().int().optional()
});
