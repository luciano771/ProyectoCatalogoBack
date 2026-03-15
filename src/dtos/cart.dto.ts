import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().min(1, 'productId requerido'),
  quantity: z.number().int().min(1, 'Cantidad mínima 1')
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Cantidad no puede ser negativa')
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export interface CartItemDto {
  productId: string;
  name: string;
  price: string;
  imageCoverUrl: string | null;
  quantity: number;
}

export interface CartDto {
  items: CartItemDto[];
}
