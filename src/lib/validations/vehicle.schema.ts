import { z } from 'zod';
import { vinSchema, yearSchema, priceSchema, currencySchema } from './common.schema';

/**
 * Schema de validación para Vehículos
 */

export const vehicleFormSchema = z.object({
  // Información básica
  vin: vinSchema,
  brand: z
    .string()
    .min(1, 'La marca es requerida')
    .min(2, 'La marca debe tener al menos 2 caracteres')
    .max(50, 'La marca no puede tener más de 50 caracteres'),
  model: z
    .string()
    .min(1, 'El modelo es requerido')
    .min(2, 'El modelo debe tener al menos 2 caracteres')
    .max(50, 'El modelo no puede tener más de 50 caracteres'),
  year: yearSchema,
  color: z
    .string()
    .min(1, 'El color es requerido')
    .min(2, 'El color debe tener al menos 2 caracteres')
    .max(30, 'El color no puede tener más de 30 caracteres'),
  condition: z.enum(['new', 'used', 'certified'], {
    required_error: 'La condición es requerida',
    invalid_type_error: 'Condición inválida',
  }),

  // Especificaciones
  transmission: z.enum(['automatic', 'manual', 'cvt', 'semi-automatic'], {
    required_error: 'La transmisión es requerida',
    invalid_type_error: 'Transmisión inválida',
  }),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid', 'plug-in-hybrid'], {
    required_error: 'El tipo de combustible es requerido',
    invalid_type_error: 'Tipo de combustible inválido',
  }),
  engineSize: z
    .string()
    .max(20, 'El tamaño del motor no puede tener más de 20 caracteres')
    .optional()
    .or(z.literal('')),
  mileage: z
    .number({
      required_error: 'El kilometraje es requerido',
      invalid_type_error: 'El kilometraje debe ser un número',
    })
    .int('El kilometraje debe ser un número entero')
    .min(0, 'El kilometraje debe ser mayor o igual a 0')
    .max(1000000, 'El kilometraje parece incorrecto'),
  doors: z
    .number({
      invalid_type_error: 'Las puertas deben ser un número',
    })
    .int('Las puertas deben ser un número entero')
    .min(1, 'Debe tener al menos 1 puerta')
    .max(8, 'Número de puertas inválido')
    .optional()
    .or(z.literal(0)),
  seats: z
    .number({
      invalid_type_error: 'Los asientos deben ser un número',
    })
    .int('Los asientos deben ser un número entero')
    .min(1, 'Debe tener al menos 1 asiento')
    .max(50, 'Número de asientos inválido')
    .optional()
    .or(z.literal(0)),

  // Precios
  price: priceSchema,
  cost: z
    .number({
      invalid_type_error: 'El costo debe ser un número',
    })
    .min(0, 'El costo debe ser mayor o igual a 0')
    .optional()
    .or(z.literal(0)),
  currency: currencySchema,

  // Descripción
  description: z
    .string()
    .max(1000, 'La descripción no puede tener más de 1000 caracteres')
    .optional()
    .or(z.literal('')),

  // Ubicación
  locationId: z
    .string()
    .optional()
    .or(z.literal('')),

  // Consignación
  isConsignment: z.boolean().optional().default(false),
}).refine(
  (data) => {
    // Validación: el costo no debe ser mayor al precio
    if (data.cost && data.cost > 0 && data.price && data.cost > data.price) {
      return false;
    }
    return true;
  },
  {
    message: 'El costo no puede ser mayor al precio de venta',
    path: ['cost'],
  }
);

// Tipo TypeScript inferido del schema
export type VehicleFormData = z.infer<typeof vehicleFormSchema>;

// Schema para actualización (todos los campos opcionales excepto id)
export const updateVehicleSchema = vehicleFormSchema.partial();
