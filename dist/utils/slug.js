"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueMerchantSlug = exports.slugify = void 0;
const database_1 = require("../config/database");
const slugify = (value) => {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
const generateUniqueMerchantSlug = async (name) => {
    const baseSlug = (0, exports.slugify)(name) || 'tienda';
    let slug = baseSlug;
    let counter = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const existing = await database_1.prisma.merchantProfile.findUnique({
            where: { slug }
        });
        if (!existing) {
            return slug;
        }
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
};
exports.generateUniqueMerchantSlug = generateUniqueMerchantSlug;
