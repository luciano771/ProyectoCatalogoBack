import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import type {
  MerchantProfileDto,
  PublicMerchantProfileDto,
  UpdateMerchantProfileInput
} from '../dtos/merchant.dto';

const toMerchantProfileDto = (mp: any): MerchantProfileDto => ({
  id: mp.id,
  businessName: mp.businessName,
  slug: mp.slug,
  description: mp.description,
  logoUrl: mp.logoUrl,
  bannerUrl: mp.bannerUrl,
  instagramUrl: mp.instagramUrl,
  paymentAlias: mp.paymentAlias,
  active: mp.active,
  backgroundColor: mp.backgroundColor,
  themeId: mp.themeId,
  createdAt: mp.createdAt,
  updatedAt: mp.updatedAt
});

const toPublicMerchantProfileDto = (mp: any): PublicMerchantProfileDto => ({
  businessName: mp.businessName,
  slug: mp.slug,
  description: mp.description,
  logoUrl: mp.logoUrl,
  bannerUrl: mp.bannerUrl,
  instagramUrl: mp.instagramUrl,
  paymentAlias: mp.paymentAlias,
  active: mp.active,
  backgroundColor: mp.backgroundColor,
  themeId: mp.themeId
});

export const getOwnMerchantProfile = async (userId: string): Promise<MerchantProfileDto> => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw AppError.notFound('Perfil de comercio no encontrado');
  }

  return toMerchantProfileDto(profile);
};

export const updateOwnMerchantProfile = async (
  userId: string,
  input: UpdateMerchantProfileInput
): Promise<MerchantProfileDto> => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw AppError.notFound('Perfil de comercio no encontrado');
  }

  if (input.slug && input.slug !== profile.slug) {
    const existingSlug = await prisma.merchantProfile.findUnique({
      where: { slug: input.slug }
    });
    if (existingSlug) {
      throw AppError.conflict('El slug ya está en uso');
    }
  }

  const updated = await prisma.merchantProfile.update({
    where: { id: profile.id },
    data: {
      businessName: input.businessName ?? profile.businessName,
      slug: input.slug ?? profile.slug,
      description:
        input.description !== undefined ? input.description : profile.description,
      logoUrl: input.logoUrl !== undefined ? input.logoUrl : profile.logoUrl,
      bannerUrl: input.bannerUrl !== undefined ? input.bannerUrl : profile.bannerUrl,
      instagramUrl:
        input.instagramUrl !== undefined ? input.instagramUrl : profile.instagramUrl,
      paymentAlias:
        input.paymentAlias !== undefined ? input.paymentAlias : profile.paymentAlias,
      active: input.active ?? profile.active,
      backgroundColor:
        input.backgroundColor !== undefined ? input.backgroundColor : profile.backgroundColor,
      themeId: input.themeId !== undefined ? input.themeId : profile.themeId
    }
  });

  return toMerchantProfileDto(updated);
};

export const getPublicMerchantProfileBySlug = async (
  slug: string
): Promise<PublicMerchantProfileDto> => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { slug }
  });

  if (!profile || !profile.active) {
    throw AppError.notFound('Tienda no encontrada');
  }

  return toPublicMerchantProfileDto(profile);
};

