import { z } from 'zod';

export const merchantProfileBaseSchema = z.object({
  businessName: z
    .string()
    .min(2, 'El nombre del negocio debe tener al menos 2 caracteres')
    .max(150),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(100)
    .transform(s => s.toLowerCase().trim())
    .refine(s => /^[a-z0-9-]+$/.test(s), 'El slug solo puede contener minúsculas, números y guiones'),
  description: z
    .string()
    .max(500, 'La descripción no puede superar 500 caracteres')
    .nullable()
    .optional(),
  logoUrl: z
    .string()
    .max(3_000_000, 'Imagen de logo demasiado grande')
    .nullable()
    .optional(),
  bannerUrl: z
    .string()
    .max(3_000_000, 'Imagen de banner demasiado grande')
    .nullable()
    .optional(),
  instagramUrl: z
    .string()
    .url('URL de Instagram inválida')
    .nullable()
    .optional(),
  paymentAlias: z
    .string()
    .max(100, 'Alias de pago demasiado largo')
    .nullable()
    .optional(),
  active: z.boolean(),
  backgroundColor: z
    .string()
    .max(20, 'Color inválido')
    .nullable()
    .optional(),
  themeId: z
    .string()
    .max(50, 'Tema inválido')
    .nullable()
    .optional()
});

export const updateMerchantProfileSchema = merchantProfileBaseSchema.partial().refine(
  data => Object.keys(data).length > 0,
  {
    message: 'Debe enviarse al menos un campo para actualizar'
  }
);

export type UpdateMerchantProfileInput = z.infer<typeof updateMerchantProfileSchema>;

export interface MerchantProfileDto {
  id: string;
  businessName: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  instagramUrl?: string | null;
  paymentAlias?: string | null;
  active: boolean;
  backgroundColor?: string | null;
  themeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const publicMerchantProfileSchema = z.object({
  businessName: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
  paymentAlias: z.string().nullable().optional(),
  active: z.boolean(),
  backgroundColor: z.string().nullable().optional(),
  themeId: z.string().nullable().optional()
});

export type PublicMerchantProfileDto = z.infer<typeof publicMerchantProfileSchema>;

