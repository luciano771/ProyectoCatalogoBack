import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import type { CreateProductInput, UpdateProductInput } from '../dtos/product.dto';
import * as uploadService from './upload.service';

export const listProductsForMerchant = async (userId: string) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });
  if (!profile) throw AppError.notFound('Perfil de comercio no encontrado');

  const list = await prisma.product.findMany({
    where: { merchantProfileId: profile.id },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return list.map(p => ({
    id: p.id,
    name: p.name,
    marca: p.marca,
    modelo: p.modelo,
    description: p.description,
    price: p.price.toString(),
    imageCoverUrl: p.imageCoverUrl,
    stock: p.stock,
    active: p.active,
    categoryId: p.categoryId,
    category: p.category,
    createdAt: p.createdAt
  }));
};

export const createProductForMerchant = async (
  userId: string,
  input: CreateProductInput
) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });
  if (!profile) throw AppError.notFound('Perfil de comercio no encontrado');

  if (input.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: input.categoryId, merchantProfileId: profile.id }
    });
    if (!cat) throw AppError.validation('Categoría no válida');
  }

  const product = await prisma.product.create({
    data: {
      merchantProfileId: profile.id,
      name: input.name,
      marca: input.marca ?? null,
      modelo: input.modelo ?? null,
      description: input.description ?? null,
      price: input.price,
      categoryId: input.categoryId ?? null,
      imageCoverUrl: input.imageCoverUrl || null,
      stock: input.stock ?? null,
      active: input.active ?? true
    }
  });
  return {
    id: product.id,
    name: product.name,
    marca: product.marca,
    modelo: product.modelo,
    description: product.description,
    price: product.price.toString(),
    imageCoverUrl: product.imageCoverUrl,
    stock: product.stock,
    active: product.active,
    categoryId: product.categoryId
  };
};

export const updateProductForMerchant = async (
  userId: string,
  productId: string,
  input: UpdateProductInput
) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });
  if (!profile) throw AppError.notFound('Perfil de comercio no encontrado');

  const existing = await prisma.product.findFirst({
    where: { id: productId, merchantProfileId: profile.id }
  });
  if (!existing) throw AppError.notFound('Producto no encontrado');

  if (input.categoryId !== undefined && input.categoryId !== null) {
    const cat = await prisma.category.findFirst({
      where: { id: input.categoryId, merchantProfileId: profile.id }
    });
    if (!cat) throw AppError.validation('Categoría no válida');
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      name: input.name ?? existing.name,
      marca: input.marca !== undefined ? input.marca : existing.marca,
      modelo: input.modelo !== undefined ? input.modelo : existing.modelo,
      description: input.description !== undefined ? input.description : existing.description,
      price: input.price !== undefined ? input.price : existing.price,
      categoryId: input.categoryId !== undefined ? input.categoryId : existing.categoryId,
      imageCoverUrl:
        input.imageCoverUrl !== undefined ? (input.imageCoverUrl || null) : existing.imageCoverUrl,
      stock: input.stock !== undefined ? input.stock : existing.stock,
      active: input.active ?? existing.active
    }
  });
  return {
    id: updated.id,
    name: updated.name,
    marca: updated.marca,
    modelo: updated.modelo,
    description: updated.description,
    price: updated.price.toString(),
    imageCoverUrl: updated.imageCoverUrl,
    stock: updated.stock,
    active: updated.active,
    categoryId: updated.categoryId
  };
};

export const deleteProductForMerchant = async (
  userId: string,
  productId: string
) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { userId }
  });
  if (!profile) throw AppError.notFound('Perfil de comercio no encontrado');

  const existing = await prisma.product.findFirst({
    where: { id: productId, merchantProfileId: profile.id }
  });
  if (!existing) throw AppError.notFound('Producto no encontrado');

  await uploadService.deleteProductImage(userId, productId);
  await prisma.product.delete({ where: { id: productId } });
  return { ok: true };
};
