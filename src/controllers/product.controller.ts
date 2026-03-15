import type { Request, Response } from 'express';
import { createProductSchema, updateProductSchema } from '../dtos/product.dto';
import * as productService from '../services/product.service';
import * as uploadService from '../services/upload.service';
import { AppError } from '../utils/errors';

export const listProductsHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const list = await productService.listProductsForMerchant(req.auth.sub);
  res.status(200).json({ products: list });
};

export const createProductHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    throw AppError.validation('Datos inválidos', parsed.error.flatten());
  }
  const product = await productService.createProductForMerchant(req.auth.sub, parsed.data);
  res.status(201).json({ product });
};

export const updateProductHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const id = req.params.id;
  if (!id) throw AppError.validation('Id requerido');
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    throw AppError.validation('Datos inválidos', parsed.error.flatten());
  }
  const product = await productService.updateProductForMerchant(req.auth.sub, id, parsed.data);
  res.status(200).json({ product });
};

export const deleteProductHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const id = req.params.id;
  if (!id) throw AppError.validation('Id requerido');
  await productService.deleteProductForMerchant(req.auth.sub, id);
  res.status(200).json({ ok: true });
};

export const uploadProductImageHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const productId = req.params.id;
  if (!productId) throw AppError.validation('Id de producto requerido');
  const file = req.file as Express.Multer.File | undefined;
  if (!file) throw AppError.validation('Se requiere el archivo de imagen');

  if (!uploadService.isAllowedMime(file.mimetype)) {
    throw AppError.validation('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
  }
  if (file.size > uploadService.getMaxSize()) {
    throw AppError.validation('La imagen no puede superar 5 MB');
  }

  const list = await productService.listProductsForMerchant(req.auth.sub);
  const product = list.find(p => p.id === productId);
  if (!product) throw AppError.notFound('Producto no encontrado');

  const { url } = await uploadService.saveImage(
    req.auth.sub,
    uploadService.getProductImageBasename(productId),
    file.buffer,
    file.mimetype
  );
  const updated = await productService.updateProductForMerchant(req.auth.sub, productId, {
    imageCoverUrl: url
  });
  res.status(200).json({ product: updated, url });
};
