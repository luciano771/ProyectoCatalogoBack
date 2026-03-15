import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  getCartDto,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  getVisitorIdCookieName,
  getVisitorIdCookieMaxAge
} from '../services/cart.service';
import { addCartItemSchema, updateCartItemSchema } from '../dtos/cart.dto';
import { AppError } from '../utils/errors';

const VISITOR_ID_MAX_AGE = getVisitorIdCookieMaxAge();

function getOrSetVisitorId(req: Request, res: Response): string {
  const name = getVisitorIdCookieName();
  let visitorId = req.cookies?.[name];
  if (!visitorId) {
    visitorId = randomUUID();
    res.cookie(name, visitorId, {
      httpOnly: true,
      maxAge: VISITOR_ID_MAX_AGE,
      sameSite: 'lax',
      path: '/'
    });
  }
  return visitorId;
}

export const getCartHandler = async (req: Request, res: Response): Promise<void> => {
  const slug = (req.params.slug ?? '').toLowerCase();
  if (!slug) {
    throw AppError.validation('Slug requerido');
  }
  const visitorId = getOrSetVisitorId(req, res);
  const cart = await getCartDto(visitorId, slug);
  res.status(200).json(cart);
};

export const addCartItemHandler = async (req: Request, res: Response): Promise<void> => {
  const slug = (req.params.slug ?? '').toLowerCase();
  if (!slug) {
    throw AppError.validation('Slug requerido');
  }
  const parseResult = addCartItemSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw AppError.validation('Datos inválidos', parseResult.error.flatten());
  }
  const visitorId = getOrSetVisitorId(req, res);
  const cart = await addCartItem(
    visitorId,
    slug,
    parseResult.data.productId,
    parseResult.data.quantity
  );
  res.status(200).json(cart);
};

export const updateCartItemHandler = async (req: Request, res: Response): Promise<void> => {
  const slug = (req.params.slug ?? '').toLowerCase();
  const productId = req.params.productId;
  if (!slug || !productId) {
    throw AppError.validation('Slug y productId requeridos');
  }
  const parseResult = updateCartItemSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw AppError.validation('Datos inválidos', parseResult.error.flatten());
  }
  const visitorId = getOrSetVisitorId(req, res);
  const cart = await updateCartItem(
    visitorId,
    slug,
    productId,
    parseResult.data.quantity
  );
  res.status(200).json(cart);
};

export const removeCartItemHandler = async (req: Request, res: Response): Promise<void> => {
  const slug = (req.params.slug ?? '').toLowerCase();
  const productId = req.params.productId;
  if (!slug || !productId) {
    throw AppError.validation('Slug y productId requeridos');
  }
  const visitorId = getOrSetVisitorId(req, res);
  const cart = await removeCartItem(visitorId, slug, productId);
  res.status(200).json(cart);
};

export const clearCartHandler = async (req: Request, res: Response): Promise<void> => {
  const slug = (req.params.slug ?? '').toLowerCase();
  if (!slug) {
    throw AppError.validation('Slug requerido');
  }
  const visitorId = getOrSetVisitorId(req, res);
  const cart = await clearCart(visitorId, slug);
  res.status(200).json(cart);
};
