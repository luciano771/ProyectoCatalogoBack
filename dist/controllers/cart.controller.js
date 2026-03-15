"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCartHandler = exports.removeCartItemHandler = exports.updateCartItemHandler = exports.addCartItemHandler = exports.getCartHandler = void 0;
const crypto_1 = require("crypto");
const cart_service_1 = require("../services/cart.service");
const cart_dto_1 = require("../dtos/cart.dto");
const errors_1 = require("../utils/errors");
const VISITOR_ID_MAX_AGE = (0, cart_service_1.getVisitorIdCookieMaxAge)();
function getOrSetVisitorId(req, res) {
    const name = (0, cart_service_1.getVisitorIdCookieName)();
    let visitorId = req.cookies?.[name];
    if (!visitorId) {
        visitorId = (0, crypto_1.randomUUID)();
        res.cookie(name, visitorId, {
            httpOnly: true,
            maxAge: VISITOR_ID_MAX_AGE,
            sameSite: 'lax',
            path: '/'
        });
    }
    return visitorId;
}
const getCartHandler = async (req, res) => {
    const { slug } = req.params;
    if (!slug) {
        throw errors_1.AppError.validation('Slug requerido');
    }
    const visitorId = getOrSetVisitorId(req, res);
    const cart = await (0, cart_service_1.getCartDto)(visitorId, slug);
    res.status(200).json(cart);
};
exports.getCartHandler = getCartHandler;
const addCartItemHandler = async (req, res) => {
    const { slug } = req.params;
    if (!slug) {
        throw errors_1.AppError.validation('Slug requerido');
    }
    const parseResult = cart_dto_1.addCartItemSchema.safeParse(req.body);
    if (!parseResult.success) {
        throw errors_1.AppError.validation('Datos inválidos', parseResult.error.flatten());
    }
    const visitorId = getOrSetVisitorId(req, res);
    const cart = await (0, cart_service_1.addCartItem)(visitorId, slug, parseResult.data.productId, parseResult.data.quantity);
    res.status(200).json(cart);
};
exports.addCartItemHandler = addCartItemHandler;
const updateCartItemHandler = async (req, res) => {
    const { slug, productId } = req.params;
    if (!slug || !productId) {
        throw errors_1.AppError.validation('Slug y productId requeridos');
    }
    const parseResult = cart_dto_1.updateCartItemSchema.safeParse(req.body);
    if (!parseResult.success) {
        throw errors_1.AppError.validation('Datos inválidos', parseResult.error.flatten());
    }
    const visitorId = getOrSetVisitorId(req, res);
    const cart = await (0, cart_service_1.updateCartItem)(visitorId, slug, productId, parseResult.data.quantity);
    res.status(200).json(cart);
};
exports.updateCartItemHandler = updateCartItemHandler;
const removeCartItemHandler = async (req, res) => {
    const { slug, productId } = req.params;
    if (!slug || !productId) {
        throw errors_1.AppError.validation('Slug y productId requeridos');
    }
    const visitorId = getOrSetVisitorId(req, res);
    const cart = await (0, cart_service_1.removeCartItem)(visitorId, slug, productId);
    res.status(200).json(cart);
};
exports.removeCartItemHandler = removeCartItemHandler;
const clearCartHandler = async (req, res) => {
    const { slug } = req.params;
    if (!slug) {
        throw errors_1.AppError.validation('Slug requerido');
    }
    const visitorId = getOrSetVisitorId(req, res);
    const cart = await (0, cart_service_1.clearCart)(visitorId, slug);
    res.status(200).json(cart);
};
exports.clearCartHandler = clearCartHandler;
