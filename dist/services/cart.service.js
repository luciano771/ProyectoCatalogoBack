"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitorIdCookieMaxAge = exports.getVisitorIdCookieName = void 0;
exports.getOrCreateCart = getOrCreateCart;
exports.getCartDto = getCartDto;
exports.addCartItem = addCartItem;
exports.updateCartItem = updateCartItem;
exports.removeCartItem = removeCartItem;
exports.clearCart = clearCart;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const COOKIE_VISITOR_ID = 'visitorId';
const COOKIE_MAX_AGE_DAYS = 365;
const getVisitorIdCookieName = () => COOKIE_VISITOR_ID;
exports.getVisitorIdCookieName = getVisitorIdCookieName;
const getVisitorIdCookieMaxAge = () => COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
exports.getVisitorIdCookieMaxAge = getVisitorIdCookieMaxAge;
function toCartItemDto(item) {
    return {
        productId: item.productId,
        name: item.product.name,
        price: String(item.product.price),
        imageCoverUrl: item.product.imageCoverUrl,
        quantity: item.quantity
    };
}
async function getMerchantBySlug(slug) {
    const merchant = await database_1.prisma.merchantProfile.findUnique({
        where: { slug, active: true }
    });
    if (!merchant) {
        throw errors_1.AppError.notFound('Tienda no encontrada');
    }
    return merchant;
}
async function getOrCreateCart(visitorId, slug) {
    const merchant = await getMerchantBySlug(slug);
    const cart = await database_1.prisma.cart.upsert({
        where: {
            visitorId_merchantProfileId: { visitorId, merchantProfileId: merchant.id }
        },
        create: {
            visitorId,
            merchantProfileId: merchant.id
        },
        update: {}
    });
    return { cartId: cart.id, merchantProfileId: merchant.id };
}
async function getCartDto(visitorId, slug) {
    const merchant = await getMerchantBySlug(slug);
    const cart = await database_1.prisma.cart.findUnique({
        where: {
            visitorId_merchantProfileId: { visitorId, merchantProfileId: merchant.id }
        },
        include: {
            items: {
                include: {
                    product: {
                        select: { name: true, price: true, imageCoverUrl: true }
                    }
                }
            }
        }
    });
    if (!cart) {
        return { items: [] };
    }
    const items = cart.items.map(i => toCartItemDto({
        productId: i.productId,
        quantity: i.quantity,
        product: i.product
    }));
    return { items };
}
async function addCartItem(visitorId, slug, productId, quantity) {
    const { cartId, merchantProfileId } = await getOrCreateCart(visitorId, slug);
    const product = await database_1.prisma.product.findFirst({
        where: {
            id: productId,
            merchantProfileId,
            active: true
        }
    });
    if (!product) {
        throw errors_1.AppError.notFound('Producto no encontrado');
    }
    if (product.stock != null && quantity > product.stock) {
        throw errors_1.AppError.validation('No hay stock suficiente');
    }
    await database_1.prisma.cartItem.upsert({
        where: {
            cartId_productId: { cartId, productId }
        },
        create: { cartId, productId, quantity },
        update: { quantity: { increment: quantity } }
    });
    return getCartDto(visitorId, slug);
}
async function updateCartItem(visitorId, slug, productId, quantity) {
    const merchant = await getMerchantBySlug(slug);
    const cart = await database_1.prisma.cart.findUnique({
        where: {
            visitorId_merchantProfileId: { visitorId, merchantProfileId: merchant.id }
        }
    });
    if (!cart) {
        return { items: [] };
    }
    if (quantity <= 0) {
        await database_1.prisma.cartItem.deleteMany({
            where: { cartId: cart.id, productId }
        });
    }
    else {
        const product = await database_1.prisma.product.findFirst({
            where: {
                id: productId,
                merchantProfileId: merchant.id,
                active: true
            }
        });
        if (!product) {
            throw errors_1.AppError.notFound('Producto no encontrado');
        }
        if (product.stock != null && quantity > product.stock) {
            throw errors_1.AppError.validation('No hay stock suficiente');
        }
        await database_1.prisma.cartItem.upsert({
            where: {
                cartId_productId: { cartId: cart.id, productId }
            },
            create: { cartId: cart.id, productId, quantity },
            update: { quantity }
        });
    }
    return getCartDto(visitorId, slug);
}
async function removeCartItem(visitorId, slug, productId) {
    return updateCartItem(visitorId, slug, productId, 0);
}
async function clearCart(visitorId, slug) {
    const merchant = await getMerchantBySlug(slug);
    const cart = await database_1.prisma.cart.findUnique({
        where: {
            visitorId_merchantProfileId: { visitorId, merchantProfileId: merchant.id }
        }
    });
    if (cart) {
        await database_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { items: [] };
}
