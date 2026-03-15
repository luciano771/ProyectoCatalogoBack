"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicMerchantProfileBySlug = exports.updateOwnMerchantProfile = exports.getOwnMerchantProfile = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const toMerchantProfileDto = (mp) => ({
    id: mp.id,
    businessName: mp.businessName,
    slug: mp.slug,
    description: mp.description,
    logoUrl: mp.logoUrl,
    bannerUrl: mp.bannerUrl,
    instagramUrl: mp.instagramUrl,
    paymentAlias: mp.paymentAlias,
    active: mp.active,
    backgroundColor: mp.backgroundColor,
    themeId: mp.themeId,
    createdAt: mp.createdAt,
    updatedAt: mp.updatedAt
});
const toPublicMerchantProfileDto = (mp) => ({
    businessName: mp.businessName,
    slug: mp.slug,
    description: mp.description,
    logoUrl: mp.logoUrl,
    bannerUrl: mp.bannerUrl,
    instagramUrl: mp.instagramUrl,
    paymentAlias: mp.paymentAlias,
    active: mp.active,
    backgroundColor: mp.backgroundColor,
    themeId: mp.themeId
});
const getOwnMerchantProfile = async (userId) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile) {
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    }
    return toMerchantProfileDto(profile);
};
exports.getOwnMerchantProfile = getOwnMerchantProfile;
const updateOwnMerchantProfile = async (userId, input) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile) {
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    }
    if (input.slug && input.slug !== profile.slug) {
        const existingSlug = await database_1.prisma.merchantProfile.findUnique({
            where: { slug: input.slug }
        });
        if (existingSlug) {
            throw errors_1.AppError.conflict('El slug ya está en uso');
        }
    }
    const updated = await database_1.prisma.merchantProfile.update({
        where: { id: profile.id },
        data: {
            businessName: input.businessName ?? profile.businessName,
            slug: input.slug ?? profile.slug,
            description: input.description !== undefined ? input.description : profile.description,
            logoUrl: input.logoUrl !== undefined ? input.logoUrl : profile.logoUrl,
            bannerUrl: input.bannerUrl !== undefined ? input.bannerUrl : profile.bannerUrl,
            instagramUrl: input.instagramUrl !== undefined ? input.instagramUrl : profile.instagramUrl,
            paymentAlias: input.paymentAlias !== undefined ? input.paymentAlias : profile.paymentAlias,
            active: input.active ?? profile.active,
            backgroundColor: input.backgroundColor !== undefined ? input.backgroundColor : profile.backgroundColor,
            themeId: input.themeId !== undefined ? input.themeId : profile.themeId
        }
    });
    return toMerchantProfileDto(updated);
};
exports.updateOwnMerchantProfile = updateOwnMerchantProfile;
const getPublicMerchantProfileBySlug = async (slug) => {
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { slug }
    });
    if (!profile || !profile.active) {
        throw errors_1.AppError.notFound('Tienda no encontrada');
    }
    return toPublicMerchantProfileDto(profile);
};
exports.getPublicMerchantProfileBySlug = getPublicMerchantProfileBySlug;
