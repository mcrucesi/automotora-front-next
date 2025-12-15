import { z } from 'zod';
import { emailSchema, phoneSchema } from './common.schema';

/**
 * Schema de validación para Clientes/Leads
 */

export const customerFormSchema = z.object({
  // Información personal
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema,
  address: z
    .string()
    .max(200, 'La dirección no puede tener más de 200 caracteres')
    .optional()
    .or(z.literal('')),

  // Tipo y fuente
  type: z.enum(['buyer', 'consigner', 'both'], {
    required_error: 'El tipo es requerido',
    invalid_type_error: 'Tipo inválido',
  }),
  source: z.enum(['web', 'phone', 'email', 'referral', 'walk_in', 'social_media', 'advertisement', 'other'], {
    required_error: 'La fuente es requerida',
    invalid_type_error: 'Fuente inválida',
  }),

  // Pipeline
  stage: z.enum(['new', 'contacted', 'qualified', 'negotiating', 'closed_won', 'closed_lost'], {
    required_error: 'La etapa es requerida',
    invalid_type_error: 'Etapa inválida',
  }),

  // Presupuesto
  budgetMin: z
    .number({
      invalid_type_error: 'El presupuesto mínimo debe ser un número',
    })
    .min(0, 'El presupuesto mínimo debe ser mayor o igual a 0')
    .optional()
    .or(z.literal(0)),
  budgetMax: z
    .number({
      invalid_type_error: 'El presupuesto máximo debe ser un número',
    })
    .min(0, 'El presupuesto máximo debe ser mayor o igual a 0')
    .optional()
    .or(z.literal(0)),

  // Notas
  notes: z
    .string()
    .max(1000, 'Las notas no pueden tener más de 1000 caracteres')
    .optional()
    .or(z.literal('')),

  // Tags
  tags: z
    .array(z.string())
    .optional()
    .default([]),
}).refine(
  (data) => {
    // Validación: el presupuesto máximo debe ser mayor o igual al mínimo
    if (data.budgetMin && data.budgetMax && data.budgetMin > 0 && data.budgetMax > 0) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  },
  {
    message: 'El presupuesto máximo debe ser mayor o igual al mínimo',
    path: ['budgetMax'],
  }
).refine(
  (data) => {
    // Validación: debe tener al menos email o teléfono
    return data.email || data.phone;
  },
  {
    message: 'Debe proporcionar al menos un email o teléfono',
    path: ['email'],
  }
);

// Tipo TypeScript inferido del schema
export type CustomerFormData = z.infer<typeof customerFormSchema>;

// Schema para actualización
export const updateCustomerSchema = customerFormSchema.partial();
