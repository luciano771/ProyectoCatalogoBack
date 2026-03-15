"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusForMerchant = exports.getOrderDetailForMerchant = exports.listOrdersForMerchant = exports.createPublicOrderForStore = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const Decimal = client_1.Prisma.Decimal;
const toOrderItemDto = (item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    unitPrice: item.unitPrice.toString(),
    quantity: item.quantity,
    subtotal: item.subtotal.toString()
});
const toOrderDto = (order) => ({
    id: order.id,
    merchantProfileId: order.merchantProfileId,
    buyerName: order.buyerName,
    buyerPhone: order.buyerPhone,
    buyerEmail: order.buyerEmail,
    totalAmount: order.totalAmount.toString(),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: (order.items ?? []).map(toOrderItemDto)
});
const createPublicOrderForStore = async (slug, input) => {
    const merchant = await database_1.prisma.merchantProfile.findUnique({
        where: { slug }
    });
    if (!merchant || !merchant.active) {
        throw errors_1.AppError.notFound('Tienda no encontrada');
    }
    const productIds = input.items.map(i => i.productId);
    const products = await database_1.prisma.product.findMany({
        where: {
            id: { in: productIds },
            merchantProfileId: merchant.id,
            active: true
        }
    });
    if (products.length !== productIds.length) {
        throw errors_1.AppError.validation('Algunos productos no existen o no están disponibles');
    }
    const productMap = new Map(products.map(p => [p.id, p]));
    let totalAmount = new Decimal(0);
    const itemsData = input.items.map(i => {
        const product = productMap.get(i.productId);
        if (!product) {
            throw errors_1.AppError.validation('Producto inválido en el pedido');
        }
        if (product.stock !== null && product.stock !== undefined) {
            if (i.quantity > product.stock) {
                throw errors_1.AppError.validation(`No hay stock suficiente para el producto "${product.name}"`);
            }
        }
        const unitPrice = product.price;
        const subtotal = unitPrice.mul(i.quantity);
        totalAmount = totalAmount.add(subtotal);
        return {
            productId: product.id,
            productName: product.name,
            unitPrice,
            quantity: i.quantity,
            subtotal
        };
    });
    const order = await database_1.prisma.$transaction(async (tx) => {
        for (const i of input.items) {
            const product = productMap.get(i.productId);
            if (!product)
                continue;
            if (product.stock !== null && product.stock !== undefined) {
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: product.stock - i.quantity }
                });
            }
        }
        const createdOrder = await tx.order.create({
            data: {
                merchantProfileId: merchant.id,
                buyerName: input.buyer.fullName,
                buyerPhone: input.buyer.phone,
                buyerEmail: input.buyer.email ?? null,
                totalAmount,
                status: client_1.OrderStatus.PENDING,
                items: {
                    create: itemsData
                }
            },
            include: {
                items: true
            }
        });
        return createdOrder;
    });
    return toOrderDto(order);
};
exports.createPublicOrderForStore = createPublicOrderForStore;
const listOrdersForMerchant = async (userId) => {
    const merchant = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!merchant) {
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    }
    const orders = await database_1.prisma.order.findMany({
        where: { merchantProfileId: merchant.id },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    });
    return orders.map(toOrderDto);
};
exports.listOrdersForMerchant = listOrdersForMerchant;
const getOrderDetailForMerchant = async (userId, orderId) => {
    const merchant = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!merchant) {
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    }
    const order = await database_1.prisma.order.findFirst({
        where: {
            id: orderId,
            merchantProfileId: merchant.id
        },
        include: { items: true }
    });
    if (!order) {
        throw errors_1.AppError.notFound('Pedido no encontrado');
    }
    return toOrderDto(order);
};
exports.getOrderDetailForMerchant = getOrderDetailForMerchant;
const updateOrderStatusForMerchant = async (userId, orderId, input) => {
    const merchant = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!merchant) {
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    }
    const order = await database_1.prisma.order.findFirst({
        where: {
            id: orderId,
            merchantProfileId: merchant.id
        },
        include: { items: true }
    });
    if (!order) {
        throw errors_1.AppError.notFound('Pedido no encontrado');
    }
    const updated = await database_1.prisma.order.update({
        where: { id: order.id },
        data: {
            status: input.status
        },
        include: { items: true }
    });
    return toOrderDto(updated);
};
exports.updateOrderStatusForMerchant = updateOrderStatusForMerchant;
