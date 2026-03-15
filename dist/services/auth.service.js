"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.login = exports.registerMerchant = void 0;
const database_1 = require("../config/database");
const password_1 = require("../utils/password");
const slug_1 = require("../utils/slug");
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
const registerMerchant = async (input) => {
    const existing = await database_1.prisma.user.findUnique({
        where: { email: input.email }
    });
    if (existing) {
        throw errors_1.AppError.conflict('Ya existe un usuario con ese email');
    }
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const slug = await (0, slug_1.generateUniqueMerchantSlug)(input.name);
    const result = await database_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: input.email,
                password: passwordHash,
                role: client_1.UserRole.MERCHANT
            }
        });
        const merchantProfile = await tx.merchantProfile.create({
            data: {
                userId: user.id,
                businessName: input.name,
                slug,
                active: true
            }
        });
        return { user, merchantProfile };
    });
    const token = (0, jwt_1.signToken)({ sub: result.user.id, role: result.user.role });
    return {
        token,
        user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role
        },
        merchantProfile: {
            id: result.merchantProfile.id,
            businessName: result.merchantProfile.businessName,
            slug: result.merchantProfile.slug,
            active: result.merchantProfile.active
        }
    };
};
exports.registerMerchant = registerMerchant;
const login = async (input) => {
    const user = await database_1.prisma.user.findUnique({
        where: { email: input.email },
        include: {
            merchantProfile: true
        }
    });
    if (!user) {
        throw errors_1.AppError.unauthorized('Credenciales inválidas');
    }
    const isValid = await (0, password_1.comparePassword)(input.password, user.password);
    if (!isValid) {
        throw errors_1.AppError.unauthorized('Credenciales inválidas');
    }
    const token = (0, jwt_1.signToken)({ sub: user.id, role: user.role });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        },
        merchantProfile: user.merchantProfile
            ? {
                id: user.merchantProfile.id,
                businessName: user.merchantProfile.businessName,
                slug: user.merchantProfile.slug,
                active: user.merchantProfile.active
            }
            : null
    };
};
exports.login = login;
const getCurrentUser = async (userId) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        include: { merchantProfile: true }
    });
    if (!user) {
        throw errors_1.AppError.notFound('Usuario no encontrado');
    }
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        merchantProfile: user.merchantProfile
            ? {
                id: user.merchantProfile.id,
                businessName: user.merchantProfile.businessName,
                slug: user.merchantProfile.slug,
                active: user.merchantProfile.active
            }
            : null
    };
};
exports.getCurrentUser = getCurrentUser;
