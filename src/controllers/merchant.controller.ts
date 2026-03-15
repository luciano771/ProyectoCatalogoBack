import type { Request, Response } from 'express';
import { updateMerchantProfileSchema } from '../dtos/merchant.dto';
import * as merchantService from '../services/merchant.service';
import * as uploadService from '../services/upload.service';
import { AppError } from '../utils/errors';

export const getMyMerchantProfileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    throw AppError.unauthorized('No autenticado');
  }

  const profile = await merchantService.getOwnMerchantProfile(req.auth.sub);
  res.status(200).json({ profile });
};

export const updateMyMerchantProfileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    throw AppError.unauthorized('No autenticado');
  }

  const parseResult = updateMerchantProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw AppError.validation('Datos de perfil inválidos', parseResult.error.flatten());
  }

  const profile = await merchantService.updateOwnMerchantProfile(
    req.auth.sub,
    parseResult.data
  );

  res.status(200).json({ profile });
};

export const getPublicMerchantProfileBySlugHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const slug = (req.params.slug ?? '').toLowerCase();
  if (!slug) {
    throw AppError.validation('Slug requerido');
  }

  const profile = await merchantService.getPublicMerchantProfileBySlug(slug);
  res.status(200).json({ profile });
};

export const uploadLogoHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const file = req.file as Express.Multer.File | undefined;
  if (!file) throw AppError.validation('Se requiere el archivo de imagen');

  if (!uploadService.isAllowedMime(file.mimetype)) {
    throw AppError.validation('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
  }
  if (file.size > uploadService.getMaxSize()) {
    throw AppError.validation('La imagen no puede superar 5 MB');
  }

  const profile = await merchantService.getOwnMerchantProfile(req.auth.sub);
  if (profile.logoUrl && uploadService.isLocalUploadUrl(profile.logoUrl)) {
    await uploadService.deleteByUrlIfLocal(profile.logoUrl);
  }

  const { url } = await uploadService.saveImage(
    req.auth.sub,
    uploadService.getLogoBasename(),
    file.buffer,
    file.mimetype
  );
  const updated = await merchantService.updateOwnMerchantProfile(req.auth.sub, { logoUrl: url });
  res.status(200).json({ profile: updated, url });
};

export const uploadBannerHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const file = req.file as Express.Multer.File | undefined;
  if (!file) throw AppError.validation('Se requiere el archivo de imagen');

  if (!uploadService.isAllowedMime(file.mimetype)) {
    throw AppError.validation('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
  }
  if (file.size > uploadService.getMaxSize()) {
    throw AppError.validation('La imagen no puede superar 5 MB');
  }

  const profile = await merchantService.getOwnMerchantProfile(req.auth.sub);
  if (profile.bannerUrl && uploadService.isLocalUploadUrl(profile.bannerUrl)) {
    await uploadService.deleteByUrlIfLocal(profile.bannerUrl);
  }

  const { url } = await uploadService.saveImage(
    req.auth.sub,
    uploadService.getBannerBasename(),
    file.buffer,
    file.mimetype
  );
  const updated = await merchantService.updateOwnMerchantProfile(req.auth.sub, { bannerUrl: url });
  res.status(200).json({ profile: updated, url });
};