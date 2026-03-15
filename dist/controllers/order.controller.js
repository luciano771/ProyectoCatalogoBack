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
exports.updateMerchantOrderStatusHandler = exports.getMerchantOrderDetailHandler = exports.listMerchantOrdersHandler = exports.createPublicOrderHandler = void 0;
const order_dto_1 = require("../dtos/order.dto");
const orderService = __importStar(require("../services/order.service"));
const errors_1 = require("../utils/errors");
const createPublicOrderHandler = async (req, res) => {
    const { slug } = req.params;
    if (!slug) {
        throw errors_1.AppError.validation('Slug requerido');
    }
    const parseResult = order_dto_1.createPublicOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
        throw errors_1.AppError.validation('Datos de pedido inválidos', parseResult.error.flatten());
    }
    const order = await orderService.createPublicOrderForStore(slug, parseResult.data);
    res.status(201).json({ order });
};
exports.createPublicOrderHandler = createPublicOrderHandler;
const listMerchantOrdersHandler = async (req, res) => {
    if (!req.auth) {
        throw errors_1.AppError.unauthorized('No autenticado');
    }
    const orders = await orderService.listOrdersForMerchant(req.auth.sub);
    res.status(200).json({ orders });
};
exports.listMerchantOrdersHandler = listMerchantOrdersHandler;
const getMerchantOrderDetailHandler = async (req, res) => {
    if (!req.auth) {
        throw errors_1.AppError.unauthorized('No autenticado');
    }
    const { id } = req.params;
    if (!id) {
        throw errors_1.AppError.validation('Id de pedido requerido');
    }
    const order = await orderService.getOrderDetailForMerchant(req.auth.sub, id);
    res.status(200).json({ order });
};
exports.getMerchantOrderDetailHandler = getMerchantOrderDetailHandler;
const updateMerchantOrderStatusHandler = async (req, res) => {
    if (!req.auth) {
        throw errors_1.AppError.unauthorized('No autenticado');
    }
    const { id } = req.params;
    if (!id) {
        throw errors_1.AppError.validation('Id de pedido requerido');
    }
    const parseResult = order_dto_1.updateOrderStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
        throw errors_1.AppError.validation('Estado de pedido inválido', parseResult.error.flatten());
    }
    const order = await orderService.updateOrderStatusForMerchant(req.auth.sub, id, parseResult.data);
    res.status(200).json({ order });
};
exports.updateMerchantOrderStatusHandler = updateMerchantOrderStatusHandler;
