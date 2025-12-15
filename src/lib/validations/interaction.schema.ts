import { z } from 'zod';

/**
 * Interaction Form Schema
 * Validación para el formulario de interacciones con clientes
 */

// Tipos de interacción disponibles
export const interactionTypeSchema = z.enum([
  'call',
  'email',
  'meeting',
  'whatsapp',
  'test_drive',
  'other',
], {
  required_error: 'El tipo de interacción es requerido',
  invalid_type_error: 'Tipo de interacción inválido',
});

// Schema principal del formulario de interacción
export const interactionFormSchema = z.object({
  type: interactionTypeSchema,

  subject: z
    .string()
    .min(3, 'El asunto debe tener al menos 3 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .min(10, 'Las notas deben tener al menos 10 caracteres')
    .max(1000, 'Las notas no pueden exceder 1000 caracteres'),

  scheduledAt: z
    .string()
    .datetime('Formato de fecha inválido')
    .optional()
    .or(z.literal('')),

  outcome: z
    .string()
    .min(3, 'El resultado debe tener al menos 3 caracteres')
    .max(500, 'El resultado no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),

  nextAction: z
    .string()
    .min(3, 'La siguiente acción debe tener al menos 3 caracteres')
    .max(500, 'La siguiente acción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

// Tipo inferido del schema
export type InteractionFormData = z.infer<typeof interactionFormSchema>;

// Labels en español para los tipos de interacción
export const interactionTypeLabels: Record<string, string> = {
  call: 'Llamada Telefónica',
  email: 'Correo Electrónico',
  meeting: 'Reunión',
  whatsapp: 'WhatsApp',
  test_drive: 'Prueba de Manejo',
  other: 'Otro',
};
