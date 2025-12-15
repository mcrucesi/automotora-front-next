import { z } from 'zod';
import { emailSchema, phoneSchema } from './common.schema';

/**
 * Schema de validación para Sucursales/Locations
 */

export const locationFormSchema = z.object({
  // Información básica
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  code: z
    .string()
    .min(1, 'El código es requerido')
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(20, 'El código no puede tener más de 20 caracteres')
    .regex(/^[A-Z0-9-_]+$/, 'El código debe ser mayúsculas, números, guiones o guiones bajos')
    .toUpperCase(),

  // Dirección
  address: z
    .string()
    .min(1, 'La dirección es requerida')
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede tener más de 200 caracteres'),
  city: z
    .string()
    .min(1, 'La ciudad es requerida')
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede tener más de 100 caracteres'),
  state: z
    .string()
    .max(100, 'El estado no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),
  zipCode: z
    .string()
    .max(20, 'El código postal no puede tener más de 20 caracteres')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .min(1, 'El país es requerido')
    .min(2, 'El país debe tener al menos 2 caracteres')
    .max(100, 'El país no puede tener más de 100 caracteres'),

  // Contacto
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal('')),

  // Gerente
  managerName: z
    .string()
    .max(100, 'El nombre del gerente no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),

  // Estado
  isActive: z.boolean().optional().default(true),
});

// Tipo TypeScript inferido del schema
export type LocationFormData = z.infer<typeof locationFormSchema>;

// Schema para actualización
export const updateLocationSchema = locationFormSchema.partial();
