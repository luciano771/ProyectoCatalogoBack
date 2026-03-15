import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { slugify } from '../utils/slug';
import type { CreateCategoryInput, UpdateCategoryInput } from '../dtos/category.dto';

const ensureUniqueSlug = async (
  merchantProfileId: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> => {
  let slug = baseSlug || 'categoria';
  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        merchantProfileId,
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

export const listCategoriesForMerchant = async (userId: string) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });
  if (!profile) throw AppError.notFound('Perfil de comercio no encontrado');

  const list = await prisma.category.findMany({
    where: { merchantProfileId: profile.id },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });
  return list.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    createdAt: c.createdAt
  }));
};

export const createCategoryForMerchant = async (
  userId: string,
  input: CreateCategoryInput
) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });
  if (!profile) throw AppError.notFound('Perfil de comercio no encontrado');

  const baseSlug = slugify(input.name) || 'categoria';
  const slug = await ensureUniqueSlug(profile.id, baseSlug);

  const category = await prisma.category.create({
    data: {
      merchantProfileId: profile.id,
      name: input.name,
      slug,
      sortOrder: input.sortOrder ?? undefined
    }
  });
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
    sortOrder: category.sortOrder
  };
};

export const updateCategoryForMerchant = async (
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput
) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });
  if (!profile) throw AppError.notFound('Perfil de comercio no encontrado');

  const existing = await prisma.category.findFirst({
    where: { id: categoryId, merchantProfileId: profile.id }
  });
  if (!existing) throw AppError.notFound('Categoría no encontrada');

  let slug = existing.slug;
  if (input.name && input.name !== existing.name) {
    const baseSlug = slugify(input.name) || 'categoria';
    slug = await ensureUniqueSlug(profile.id, baseSlug, categoryId);
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: input.name ?? existing.name,
      slug,
      isActive: input.isActive ?? existing.isActive,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder
    }
  });
  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    isActive: updated.isActive,
    sortOrder: updated.sortOrder
  };
};

export const deleteCategoryForMerchant = async (
  userId: string,
  categoryId: string
) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });
  if (!profile) throw AppError.notFound('Perfil de comercio no encontrado');

  const existing = await prisma.category.findFirst({
    where: { id: categoryId, merchantProfileId: profile.id }
  });
  if (!existing) throw AppError.notFound('Categoría no encontrada');

  await prisma.category.delete({ where: { id: categoryId } });
  return { ok: true };
};
