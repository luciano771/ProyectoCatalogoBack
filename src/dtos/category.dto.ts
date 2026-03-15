import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(100),
  sortOrder: z.number().int().optional()
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
