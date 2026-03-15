"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryForMerchant = exports.updateCategoryForMerchant = exports.createCategoryForMerchant = exports.listCategoriesForMerchant = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const slug_1 = require("../utils/slug");
const ensureUniqueSlug = async (merchantProfileId, baseSlug, excludeId) => {
    let slug = baseSlug || 'categoria';
    let counter = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const existing = await database_1.prisma.category.findFirst({
            where: {
                merchantProfileId,
                slug,
                ...(excludeId ? { id: { not: excludeId } } : {})
            }
        });
        if (!existing)
            return slug;
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
};
const listCategoriesForMerchant = async (userId) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile)
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    const list = await database_1.prisma.category.findMany({
        where: { merchantProfileId: profile.id },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
    return list.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        isActive: c.isActive,
        sortOrder: c.sortOrder,
        createdAt: c.createdAt
    }));
};
exports.listCategoriesForMerchant = listCategoriesForMerchant;
const createCategoryForMerchant = async (userId, input) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile)
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    const baseSlug = (0, slug_1.slugify)(input.name) || 'categoria';
    const slug = await ensureUniqueSlug(profile.id, baseSlug);
    const category = await database_1.prisma.category.create({
        data: {
            merchantProfileId: profile.id,
            name: input.name,
            slug,
            sortOrder: input.sortOrder ?? undefined
        }
    });
    return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
        sortOrder: category.sortOrder
    };
};
exports.createCategoryForMerchant = createCategoryForMerchant;
const updateCategoryForMerchant = async (userId, categoryId, input) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile)
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    const existing = await database_1.prisma.category.findFirst({
        where: { id: categoryId, merchantProfileId: profile.id }
    });
    if (!existing)
        throw errors_1.AppError.notFound('Categoría no encontrada');
    let slug = existing.slug;
    if (input.name && input.name !== existing.name) {
        const baseSlug = (0, slug_1.slugify)(input.name) || 'categoria';
        slug = await ensureUniqueSlug(profile.id, baseSlug, categoryId);
    }
    const updated = await database_1.prisma.category.update({
        where: { id: categoryId },
        data: {
            name: input.name ?? existing.name,
            slug,
            isActive: input.isActive ?? existing.isActive,
            sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder
        }
    });
    return {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        isActive: updated.isActive,
        sortOrder: updated.sortOrder
    };
};
exports.updateCategoryForMerchant = updateCategoryForMerchant;
const deleteCategoryForMerchant = async (userId, categoryId) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile)
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    const existing = await database_1.prisma.category.findFirst({
        where: { id: categoryId, merchantProfileId: profile.id }
    });
    if (!existing)
        throw errors_1.AppError.notFound('Categoría no encontrada');
    await database_1.prisma.category.delete({ where: { id: categoryId } });
    return { ok: true };
};
exports.deleteCategoryForMerchant = deleteCategoryForMerchant;
