import { z } from 'zod';

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'productId requerido'),
  quantity: z
    .number()
    .int('La cantidad debe ser un entero')
    .min(1, 'La cantidad mínima es 1')
});

export const createPublicOrderSchema = z.object({
  buyer: z.object({
    fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
    phone: z.string().min(6, 'El teléfono es inválido').max(20),
    email: z
      .string()
      .email('Email inválido')
      .optional()
      .or(z.literal('').transform(() => undefined))
  }),
  items: z.array(orderItemInputSchema).min(1, 'Debe haber al menos un ítem en el pedido')
});

export type CreatePublicOrderInput = z.infer<typeof createPublicOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'DELIVERED'])
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface OrderDto {
  id: string;
  merchantProfileId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string | null;
  totalAmount: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'DELIVERED';
  createdAt: string;
  items: OrderItemDto[];
}

