import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(200),
  marca: z.string().max(100).optional().nullable(),
  modelo: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional(),
  price: z.number().positive('Precio debe ser mayor a 0'),
  categoryId: z.string().optional().nullable(),
  imageCoverUrl: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .refine(
      v => !v || v === '' || v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'),
      { message: 'Debe ser una URL o ruta válida' }
    )
    .or(z.literal('')),
  stock: z.number().int().min(0).optional().nullable(),
  active: z.boolean().optional()
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  marca: z.string().max(100).optional().nullable(),
  modelo: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().positive().optional(),
  categoryId: z.string().optional().nullable(),
  imageCoverUrl: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .refine(
      v => !v || v === '' || v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'),
      { message: 'Debe ser una URL o ruta válida' }
    )
    .or(z.literal('')),
  stock: z.number().int().min(0).optional().nullable(),
  active: z.boolean().optional()
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
