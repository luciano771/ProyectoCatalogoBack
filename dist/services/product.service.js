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
exports.deleteProductForMerchant = exports.updateProductForMerchant = exports.createProductForMerchant = exports.listProductsForMerchant = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const uploadService = __importStar(require("./upload.service"));
const listProductsForMerchant = async (userId) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile)
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    const list = await database_1.prisma.product.findMany({
        where: { merchantProfileId: profile.id },
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' }
    });
    return list.map(p => ({
        id: p.id,
        name: p.name,
        marca: p.marca,
        modelo: p.modelo,
        description: p.description,
        price: p.price.toString(),
        imageCoverUrl: p.imageCoverUrl,
        stock: p.stock,
        active: p.active,
        categoryId: p.categoryId,
        category: p.category,
        createdAt: p.createdAt
    }));
};
exports.listProductsForMerchant = listProductsForMerchant;
const createProductForMerchant = async (userId, input) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile)
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    if (input.categoryId) {
        const cat = await database_1.prisma.category.findFirst({
            where: { id: input.categoryId, merchantProfileId: profile.id }
        });
        if (!cat)
            throw errors_1.AppError.validation('Categoría no válida');
    }
    const product = await database_1.prisma.product.create({
        data: {
            merchantProfileId: profile.id,
            name: input.name,
            marca: input.marca ?? null,
            modelo: input.modelo ?? null,
            description: input.description ?? null,
            price: input.price,
            categoryId: input.categoryId ?? null,
            imageCoverUrl: input.imageCoverUrl || null,
            stock: input.stock ?? null,
            active: input.active ?? true
        }
    });
    return {
        id: product.id,
        name: product.name,
        marca: product.marca,
        modelo: product.modelo,
        description: product.description,
        price: product.price.toString(),
        imageCoverUrl: product.imageCoverUrl,
        stock: product.stock,
        active: product.active,
        categoryId: product.categoryId
    };
};
exports.createProductForMerchant = createProductForMerchant;
const updateProductForMerchant = async (userId, productId, input) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile)
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    const existing = await database_1.prisma.product.findFirst({
        where: { id: productId, merchantProfileId: profile.id }
    });
    if (!existing)
        throw errors_1.AppError.notFound('Producto no encontrado');
    if (input.categoryId !== undefined && input.categoryId !== null) {
        const cat = await database_1.prisma.category.findFirst({
            where: { id: input.categoryId, merchantProfileId: profile.id }
        });
        if (!cat)
            throw errors_1.AppError.validation('Categoría no válida');
    }
    const updated = await database_1.prisma.product.update({
        where: { id: productId },
        data: {
            name: input.name ?? existing.name,
            marca: input.marca !== undefined ? input.marca : existing.marca,
            modelo: input.modelo !== undefined ? input.modelo : existing.modelo,
            description: input.description !== undefined ? input.description : existing.description,
            price: input.price !== undefined ? input.price : existing.price,
            categoryId: input.categoryId !== undefined ? input.categoryId : existing.categoryId,
            imageCoverUrl: input.imageCoverUrl !== undefined ? (input.imageCoverUrl || null) : existing.imageCoverUrl,
            stock: input.stock !== undefined ? input.stock : existing.stock,
            active: input.active ?? existing.active
        }
    });
    return {
        id: updated.id,
        name: updated.name,
        marca: updated.marca,
        modelo: updated.modelo,
        description: updated.description,
        price: updated.price.toString(),
        imageCoverUrl: updated.imageCoverUrl,
        stock: updated.stock,
        active: updated.active,
        categoryId: updated.categoryId
    };
};
exports.updateProductForMerchant = updateProductForMerchant;
const deleteProductForMerchant = async (userId, productId) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile)
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    const existing = await database_1.prisma.product.findFirst({
        where: { id: productId, merchantProfileId: profile.id }
    });
    if (!existing)
        throw errors_1.AppError.notFound('Producto no encontrado');
    await uploadService.deleteProductImage(userId, productId);
    await database_1.prisma.product.delete({ where: { id: productId } });
    return { ok: true };
};
exports.deleteProductForMerchant = deleteProductForMerchant;
