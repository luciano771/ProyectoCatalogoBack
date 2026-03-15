import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

export const getPublicCatalogBySlug = async (slug: string) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { slug }
  });
  if (!profile || !profile.active) {
    throw AppError.notFound('Tienda no encontrada');
  }

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { merchantProfileId: profile.id, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true }
    }),
    prisma.product.findMany({
      where: { merchantProfileId: profile.id, active: true },
      select: {
        id: true,
        name: true,
        marca: true,
        modelo: true,
        description: true,
        price: true,
        imageCoverUrl: true,
        active: true,
        categoryId: true,
        stock: true
      }
    })
  ]);

  return {
    profile: {
      businessName: profile.businessName,
      slug: profile.slug,
      description: profile.description,
      logoUrl: profile.logoUrl,
      bannerUrl: profile.bannerUrl,
      instagramUrl: profile.instagramUrl,
      paymentAlias: profile.paymentAlias,
      active: profile.active,
      backgroundColor: profile.backgroundColor,
      themeId: profile.themeId
    },
    categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      marca: p.marca,
      modelo: p.modelo,
      description: p.description,
      price: p.price.toString(),
      imageCoverUrl: p.imageCoverUrl,
      active: p.active,
      categoryId: p.categoryId,
      stock: p.stock
    }))
  };
};

export const getPublicProductBySlugAndId = async (slug: string, productId: string) => {
  const profile = await prisma.merchantProfile.findUnique({
    where: { slug, active: true }
  });
  if (!profile) {
    throw AppError.notFound('Tienda no encontrada');
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      merchantProfileId: profile.id,
      active: true
    },
    include: {
      category: { select: { id: true, name: true, slug: true } }
    }
  });

  if (!product) {
    throw AppError.notFound('Producto no encontrado');
  }

  const related = product.categoryId
    ? await prisma.product.findMany({
        where: {
          merchantProfileId: profile.id,
          active: true,
          categoryId: product.categoryId,
          id: { not: product.id }
        },
        take: 4,
        select: {
          id: true,
          name: true,
          marca: true,
          modelo: true,
          description: true,
          price: true,
          imageCoverUrl: true,
          active: true,
          categoryId: true,
          stock: true
        }
      })
    : [];

  return {
    profile: {
      businessName: profile.businessName,
      slug: profile.slug,
      description: profile.description,
      logoUrl: profile.logoUrl,
      bannerUrl: profile.bannerUrl,
      instagramUrl: profile.instagramUrl,
      paymentAlias: profile.paymentAlias,
      active: profile.active,
      backgroundColor: profile.backgroundColor,
      themeId: profile.themeId
    },
    product: {
      id: product.id,
      name: product.name,
      marca: product.marca,
      modelo: product.modelo,
      description: product.description,
      price: product.price.toString(),
      imageCoverUrl: product.imageCoverUrl,
      active: product.active,
      categoryId: product.categoryId,
      stock: product.stock,
      categoryName: product.category?.name ?? null
    },
    related: related.map(p => ({
      id: p.id,
      name: p.name,
      marca: p.marca,
      modelo: p.modelo,
      description: p.description,
      price: p.price.toString(),
      imageCoverUrl: p.imageCoverUrl,
      active: p.active,
      categoryId: p.categoryId,
      stock: p.stock
    }))
  };
};
