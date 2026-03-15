import type { Request, Response } from 'express';
import * as catalogService from '../services/catalog.service';
import { AppError } from '../utils/errors';

export const getPublicCatalogHandler = async (req: Request, res: Response): Promise<void> => {
  const slug = (req.params.slug ?? '').toLowerCase();
  if (!slug) throw AppError.validation('Slug requerido');
  const data = await catalogService.getPublicCatalogBySlug(slug);
  res.status(200).json(data);
};

export const getPublicProductHandler = async (req: Request, res: Response): Promise<void> => {
  const slug = (req.params.slug ?? '').toLowerCase();
  const productId = req.params.productId;
  if (!slug || !productId) throw AppError.validation('Slug y productId requeridos');
  const data = await catalogService.getPublicProductBySlugAndId(slug, productId);
  res.status(200).json(data);
};
