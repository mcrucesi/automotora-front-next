import { z } from 'zod';

/**
 * Schemas comunes reutilizables
 */

// Validación de email
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'El email es requerido');

// Validación de teléfono
export const phoneSchema = z
  .string()
  .regex(/^[0-9\s\-\+\(\)]+$/, 'Formato de teléfono inválido')
  .min(10, 'El teléfono debe tener al menos 10 dígitos')
  .optional()
  .or(z.literal(''));

// Validación de VIN (Vehicle Identification Number)
export const vinSchema = z
  .string()
  .transform((val) => val.toUpperCase())
  .pipe(
    z.string()
      .length(17, 'El VIN debe tener 17 caracteres')
      .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Formato de VIN inválido (no debe contener I, O, Q)')
  );

// Validación de año
export const yearSchema = z
  .number({
    required_error: 'El año es requerido',
    invalid_type_error: 'El año debe ser un número',
  })
  .int('El año debe ser un número entero')
  .min(1900, 'El año debe ser mayor a 1900')
  .max(new Date().getFullYear() + 1, `El año no puede ser mayor a ${new Date().getFullYear() + 1}`);

// Validación de precio/monto
export const priceSchema = z
  .number({
    required_error: 'El precio es requerido',
    invalid_type_error: 'El precio debe ser un número',
  })
  .positive('El precio debe ser mayor a 0')
  .min(0.01, 'El precio debe ser mayor a 0');

// Validación de porcentaje
export const percentageSchema = z
  .number({
    required_error: 'El porcentaje es requerido',
    invalid_type_error: 'El porcentaje debe ser un número',
  })
  .min(0, 'El porcentaje debe ser mayor o igual a 0')
  .max(100, 'El porcentaje no puede ser mayor a 100');

// Validación de moneda
export const currencySchema = z.enum(['CLP', 'USD', 'EUR', 'MXN', 'COP'], {
  required_error: 'La moneda es requerida',
  invalid_type_error: 'Moneda inválida',
});
