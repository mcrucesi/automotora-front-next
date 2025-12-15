import { z } from 'zod';
import { priceSchema } from './common.schema';

/**
 * Sale Form Schema
 * Validación para el formulario de ventas
 */

// Métodos de pago disponibles
export const paymentMethodSchema = z.enum([
  'cash',
  'credit_card',
  'debit_card',
  'bank_transfer',
  'financing',
  'mixed',
], {
  required_error: 'El método de pago es requerido',
  invalid_type_error: 'Método de pago inválido',
});

// Schema base del formulario de venta
const baseSaleFormSchema = z.object({
  vehicleId: z
    .string()
    .min(1, 'Debes seleccionar un vehículo')
    .uuid('ID de vehículo inválido'),

  customerId: z
    .string()
    .min(1, 'Debes seleccionar un cliente')
    .uuid('ID de cliente inválido'),

  salePrice: priceSchema,

  discount: z
    .number({
      invalid_type_error: 'El descuento debe ser un número',
    })
    .min(0, 'El descuento no puede ser negativo')
    .optional()
    .or(z.literal(0)),

  commissionRate: z
    .number({
      invalid_type_error: 'La comisión debe ser un número',
    })
    .min(0, 'La comisión no puede ser negativa')
    .max(100, 'La comisión no puede ser mayor a 100%')
    .default(5),

  paymentMethod: paymentMethodSchema,

  downPayment: z
    .number({
      invalid_type_error: 'El enganche debe ser un número',
    })
    .min(0, 'El enganche no puede ser negativo')
    .optional(),

  financingMonths: z
    .number({
      invalid_type_error: 'Los meses deben ser un número',
    })
    .int('Los meses deben ser un número entero')
    .min(1, 'Debe ser al menos 1 mes')
    .max(120, 'No puede ser mayor a 120 meses')
    .optional(),

  monthlyPayment: z
    .number({
      invalid_type_error: 'El pago mensual debe ser un número',
    })
    .min(0, 'El pago mensual no puede ser negativo')
    .optional(),

  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),

  soldAt: z
    .string()
    .datetime('Formato de fecha inválido')
    .optional(),

  deliveryDate: z
    .string()
    .datetime('Formato de fecha inválido')
    .optional()
    .or(z.literal('')),
});

// Schema con refinamientos (validaciones customizadas)
export const saleFormSchema = baseSaleFormSchema
  .refine(
    (data) => {
      // Si hay descuento, no puede ser mayor al precio de venta
      if (data.discount && data.discount > 0) {
        return data.discount <= data.salePrice;
      }
      return true;
    },
    {
      message: 'El descuento no puede ser mayor al precio de venta',
      path: ['discount'],
    }
  )
  .refine(
    (data) => {
      // Si el método de pago es financiamiento, validar campos requeridos
      if (data.paymentMethod === 'financing') {
        return !!(data.downPayment && data.financingMonths);
      }
      return true;
    },
    {
      message: 'El enganche y los meses son requeridos para financiamiento',
      path: ['downPayment'],
    }
  )
  .refine(
    (data) => {
      // Si hay enganche, debe ser menor al precio de venta
      if (data.downPayment && data.downPayment > 0) {
        const finalPrice = data.salePrice - (data.discount || 0);
        return data.downPayment < finalPrice;
      }
      return true;
    },
    {
      message: 'El enganche debe ser menor al precio final de venta',
      path: ['downPayment'],
    }
  )
  .refine(
    (data) => {
      // Si hay fecha de entrega, debe ser posterior a la fecha de venta
      if (data.deliveryDate && data.soldAt) {
        const saleDate = new Date(data.soldAt);
        const deliveryDate = new Date(data.deliveryDate);
        return deliveryDate >= saleDate;
      }
      return true;
    },
    {
      message: 'La fecha de entrega debe ser posterior a la fecha de venta',
      path: ['deliveryDate'],
    }
  );

// Tipo inferido del schema
export type SaleFormData = z.infer<typeof saleFormSchema>;

// Labels en español para los métodos de pago
export const paymentMethodLabels: Record<string, string> = {
  cash: 'Efectivo',
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  bank_transfer: 'Transferencia Bancaria',
  financing: 'Financiamiento',
  mixed: 'Mixto',
};
