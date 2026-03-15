import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import type { CartDto, CartItemDto } from '../dtos/cart.dto';

const COOKIE_VISITOR_ID = 'visitorId';
const COOKIE_MAX_AGE_DAYS = 365;

export const getVisitorIdCookieName = () => COOKIE_VISITOR_ID;
export const getVisitorIdCookieMaxAge = () => COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;

function toCartItemDto(item: { productId: string; quantity: number; product: { name: string; price: unknown; imageCoverUrl: string | null } }): CartItemDto {
  return {
    productId: item.productId,
    name: item.product.name,
    price: String(item.product.price),
    imageCoverUrl: item.product.imageCoverUrl,
    quantity: item.quantity
  };
}

async function getMerchantBySlug(slug: string) {
  const merchant = await prisma.merchantProfile.findUnique({
    where: { slug, active: true }
  });
  if (!merchant) {
    throw AppError.notFound('Tienda no encontrada');
  }
  return merchant;
}

export async function getOrCreateCart(
  visitorId: string,
  slug: string
): Promise<{ cartId: string; merchantProfileId: string }> {
  const merchant = await getMerchantBySlug(slug);

  const cart = await prisma.cart.upsert({
    where: {
      visitorId_merchantProfileId: { visitorId, merchantProfileId: merchant.id }
    },
    create: {
      visitorId,
      merchantProfileId: merchant.id
    },
    update: {}
  });

  return { cartId: cart.id, merchantProfileId: merchant.id };
}

export async function getCartDto(visitorId: string, slug: string): Promise<CartDto> {
  const merchant = await getMerchantBySlug(slug);

  const cart = await prisma.cart.findUnique({
    where: {
      visitorId_merchantProfileId: { visitorId, merchantProfileId: merchant.id }
    },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, price: true, imageCoverUrl: true }
          }
        }
      }
    }
  });

  if (!cart) {
    return { items: [] };
  }

  const items: CartItemDto[] = cart.items.map(i => toCartItemDto({
    productId: i.productId,
    quantity: i.quantity,
    product: i.product
  }));

  return { items };
}

export async function addCartItem(
  visitorId: string,
  slug: string,
  productId: string,
  quantity: number
): Promise<CartDto> {
  const { cartId, merchantProfileId } = await getOrCreateCart(visitorId, slug);

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      merchantProfileId,
      active: true
    }
  });

  if (!product) {
    throw AppError.notFound('Producto no encontrado');
  }

  if (product.stock != null && quantity > product.stock) {
    throw AppError.validation('No hay stock suficiente');
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId, productId }
    },
    create: { cartId, productId, quantity },
    update: { quantity: { increment: quantity } }
  });

  return getCartDto(visitorId, slug);
}

export async function updateCartItem(
  visitorId: string,
  slug: string,
  productId: string,
  quantity: number
): Promise<CartDto> {
  const merchant = await getMerchantBySlug(slug);

  const cart = await prisma.cart.findUnique({
    where: {
      visitorId_merchantProfileId: { visitorId, merchantProfileId: merchant.id }
    }
  });

  if (!cart) {
    return { items: [] };
  }

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId }
    });
  } else {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        merchantProfileId: merchant.id,
        active: true
      }
    });
    if (!product) {
      throw AppError.notFound('Producto no encontrado');
    }
    if (product.stock != null && quantity > product.stock) {
      throw AppError.validation('No hay stock suficiente');
    }
    await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId }
      },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity }
    });
  }

  return getCartDto(visitorId, slug);
}

export async function removeCartItem(
  visitorId: string,
  slug: string,
  productId: string
): Promise<CartDto> {
  return updateCartItem(visitorId, slug, productId, 0);
}

export async function clearCart(visitorId: string, slug: string): Promise<CartDto> {
  const merchant = await getMerchantBySlug(slug);

  const cart = await prisma.cart.findUnique({
    where: {
      visitorId_merchantProfileId: { visitorId, merchantProfileId: merchant.id }
    }
  });

  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return { items: [] };
}
