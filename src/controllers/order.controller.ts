import type { Request, Response } from 'express';
import {
  createPublicOrderSchema,
  updateOrderStatusSchema
} from '../dtos/order.dto';
import * as orderService from '../services/order.service';
import { AppError } from '../utils/errors';

export const createPublicOrderHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const slug = (req.params.slug ?? '').toLowerCase();
  if (!slug) {
    throw AppError.validation('Slug requerido');
  }

  const parseResult = createPublicOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw AppError.validation('Datos de pedido inválidos', parseResult.error.flatten());
  }

  const order = await orderService.createPublicOrderForStore(slug, parseResult.data);
  res.status(201).json({ order });
};

export const listMerchantOrdersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    throw AppError.unauthorized('No autenticado');
  }

  const orders = await orderService.listOrdersForMerchant(req.auth.sub);
  res.status(200).json({ orders });
};

export const getMerchantOrderDetailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    throw AppError.unauthorized('No autenticado');
  }

  const { id } = req.params;
  if (!id) {
    throw AppError.validation('Id de pedido requerido');
  }

  const order = await orderService.getOrderDetailForMerchant(req.auth.sub, id);
  res.status(200).json({ order });
};

export const updateMerchantOrderStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    throw AppError.unauthorized('No autenticado');
  }

  const { id } = req.params;
  if (!id) {
    throw AppError.validation('Id de pedido requerido');
  }

  const parseResult = updateOrderStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw AppError.validation('Estado de pedido inválido', parseResult.error.flatten());
  }

  const order = await orderService.updateOrderStatusForMerchant(
    req.auth.sub,
    id,
    parseResult.data
  );

  res.status(200).json({ order });
};

