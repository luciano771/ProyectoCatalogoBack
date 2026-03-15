import type { Request, Response } from 'express';
import { createCategorySchema, updateCategorySchema } from '../dtos/category.dto';
import * as categoryService from '../services/category.service';
import { AppError } from '../utils/errors';

export const listCategoriesHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const list = await categoryService.listCategoriesForMerchant(req.auth.sub);
  res.status(200).json({ categories: list });
};

export const createCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw AppError.validation('Datos inválidos', parsed.error.flatten());
  }
  const category = await categoryService.createCategoryForMerchant(req.auth.sub, parsed.data);
  res.status(201).json({ category });
};

export const updateCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const id = req.params.id;
  if (!id) throw AppError.validation('Id requerido');
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw AppError.validation('Datos inválidos', parsed.error.flatten());
  }
  const category = await categoryService.updateCategoryForMerchant(req.auth.sub, id, parsed.data);
  res.status(200).json({ category });
};

export const deleteCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const id = req.params.id;
  if (!id) throw AppError.validation('Id requerido');
  await categoryService.deleteCategoryForMerchant(req.auth.sub, id);
  res.status(200).json({ ok: true });
};
