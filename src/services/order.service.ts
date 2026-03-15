import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import type {
  CreatePublicOrderInput,
  OrderDto,
  OrderItemDto,
  UpdateOrderStatusInput
} from '../dtos/order.dto';

const Decimal = Prisma.Decimal;

const toOrderItemDto = (item: any): OrderItemDto => ({
  id: item.id,
  productId: item.productId,
  productName: item.productName,
  unitPrice: item.unitPrice.toString(),
  quantity: item.quantity,
  subtotal: item.subtotal.toString()
});

const toOrderDto = (order: any): OrderDto => ({
  id: order.id,
  merchantProfileId: order.merchantProfileId,
  buyerName: order.buyerName,
  buyerPhone: order.buyerPhone,
  buyerEmail: order.buyerEmail,
  totalAmount: order.totalAmount.toString(),
  status: order.status,
  createdAt: order.createdAt.toISOString(),
  items: (order.items ?? []).map(toOrderItemDto)
});

export const createPublicOrderForStore = async (
  slug: string,
  input: CreatePublicOrderInput
): Promise<OrderDto> => {
  const merchant = await prisma.merchantProfile.findUnique({
    where: { slug }
  });

  if (!merchant || !merchant.active) {
    throw AppError.notFound('Tienda no encontrada');
  }

  const productIds = input.items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      merchantProfileId: merchant.id,
      active: true
    }
  });

  if (products.length !== productIds.length) {
    throw AppError.validation('Algunos productos no existen o no están disponibles');
  }

  const productMap = new Map(products.map(p => [p.id, p]));

  let totalAmount = new Decimal(0);

  const itemsData = input.items.map(i => {
    const product = productMap.get(i.productId);
    if (!product) {
      throw AppError.validation('Producto inválido en el pedido');
    }

    if (product.stock !== null && product.stock !== undefined) {
      if (i.quantity > product.stock) {
        throw AppError.validation(
          `No hay stock suficiente para el producto "${product.name}"`
        );
      }
    }

    const unitPrice = product.price as Prisma.Decimal;
    const subtotal = unitPrice.mul(i.quantity);
    totalAmount = totalAmount.add(subtotal);

    return {
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity: i.quantity,
      subtotal
    };
  });

  const order = await prisma.$transaction(async tx => {
    for (const i of input.items) {
      const product = productMap.get(i.productId);
      if (!product) continue;
      if (product.stock !== null && product.stock !== undefined) {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - i.quantity }
        });
      }
    }

    const createdOrder = await tx.order.create({
      data: {
        merchantProfileId: merchant.id,
        buyerName: input.buyer.fullName,
        buyerPhone: input.buyer.phone,
        buyerEmail: input.buyer.email ?? null,
        totalAmount,
        status: OrderStatus.PENDING,
        items: {
          create: itemsData
        }
      },
      include: {
        items: true
      }
    });

    return createdOrder;
  });

  return toOrderDto(order);
};

export const listOrdersForMerchant = async (userId: string): Promise<OrderDto[]> => {
  const merchant = await prisma.merchantProfile.findUnique({
    where: { userId }
  });

  if (!merchant) {
    throw AppError.notFound('Perfil de comercio no encontrado');
  }

  const orders = await prisma.order.findMany({
    where: { merchantProfileId: merchant.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  return orders.map(toOrderDto);
};

export const getOrderDetailForMerchant = async (
  userId: string,
  orderId: string
): Promise<OrderDto> => {
  const merchant = await prisma.merchantProfile.findUnique({
    where: { userId }
  });

  if (!merchant) {
    throw AppError.notFound('Perfil de comercio no encontrado');
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      merchantProfileId: merchant.id
    },
    include: { items: true }
  });

  if (!order) {
    throw AppError.notFound('Pedido no encontrado');
  }

  return toOrderDto(order);
};

export const updateOrderStatusForMerchant = async (
  userId: string,
  orderId: string,
  input: UpdateOrderStatusInput
): Promise<OrderDto> => {
  const merchant = await prisma.merchantProfile.findUnique({
    where: { userId }
  });

  if (!merchant) {
    throw AppError.notFound('Perfil de comercio no encontrado');
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      merchantProfileId: merchant.id
    },
    include: { items: true }
  });

  if (!order) {
    throw AppError.notFound('Pedido no encontrado');
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: input.status as OrderStatus
    },
    include: { items: true }
  });

  return toOrderDto(updated);
};

