import { vehicleFormSchema } from '../vehicle.schema';

describe('vehicleFormSchema', () => {
  describe('Validaciones básicas', () => {
    it('valida un vehículo correcto', () => {
      const validVehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: 25000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(validVehicle);
      expect(result.success).toBe(true);
    });

    it('rechaza un vehículo con campos faltantes', () => {
      const invalidVehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        // Falta model y otros campos requeridos
      };

      const result = vehicleFormSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
    });
  });

  describe('Validación de VIN', () => {
    it('acepta un VIN válido de 17 caracteres', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        color: 'Negro',
        condition: 'used' as const,
        transmission: 'manual' as const,
        fuelType: 'gasoline' as const,
        mileage: 30000,
        price: 20000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it('rechaza un VIN menor a 17 caracteres', () => {
      const vehicle = {
        vin: '1HGBH41JXM', // Solo 10 caracteres
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        color: 'Negro',
        condition: 'used' as const,
        transmission: 'manual' as const,
        fuelType: 'gasoline' as const,
        mileage: 30000,
        price: 20000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('17 caracteres');
      }
    });

    it('rechaza un VIN con caracteres inválidos (I, O, Q)', () => {
      const vehicle = {
        vin: '1HGBH41IXMN109186', // Contiene 'I'
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        color: 'Negro',
        condition: 'used' as const,
        transmission: 'manual' as const,
        fuelType: 'gasoline' as const,
        mileage: 30000,
        price: 20000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it('convierte el VIN a mayúsculas', () => {
      const vehicle = {
        vin: '1hgbh41jxmn109186', // Minúsculas
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        color: 'Negro',
        condition: 'used' as const,
        transmission: 'manual' as const,
        fuelType: 'gasoline' as const,
        mileage: 30000,
        price: 20000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.vin).toBe('1HGBH41JXMN109186');
      }
    });
  });

  describe('Validación de año', () => {
    const currentYear = new Date().getFullYear();

    it('acepta años válidos', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: 25000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it('rechaza años menores a 1900', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 1850,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: 25000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it('rechaza años mayores al año siguiente', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: currentYear + 2,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: 25000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });
  });

  describe('Validación de precios', () => {
    it('acepta precio positivo', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: 25000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it('rechaza precio cero', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: 0,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it('rechaza precio negativo', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: -1000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it('rechaza cuando el costo es mayor al precio', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: 20000,
        cost: 25000, // Costo mayor al precio
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('costo no puede ser mayor');
      }
    });
  });

  describe('Validación de kilometraje', () => {
    it('acepta kilometraje válido', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: 25000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
    });

    it('rechaza kilometraje negativo', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: -100,
        price: 25000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it('rechaza kilometraje excesivo', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        condition: 'used' as const,
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 2000000, // Más de 1 millón
        price: 25000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });
  });

  describe('Validación de enums', () => {
    it('acepta condiciones válidas', () => {
      const conditions = ['new', 'used', 'certified'] as const;

      conditions.forEach((condition) => {
        const vehicle = {
          vin: '1HGBH41JXMN109186',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2023,
          color: 'Blanco',
          condition,
          transmission: 'automatic' as const,
          fuelType: 'gasoline' as const,
          mileage: 50000,
          price: 25000,
          currency: 'USD' as const,
        };

        const result = vehicleFormSchema.safeParse(vehicle);
        expect(result.success).toBe(true);
      });
    });

    it('rechaza condiciones inválidas', () => {
      const vehicle = {
        vin: '1HGBH41JXMN109186',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        condition: 'broken', // Inválido
        transmission: 'automatic' as const,
        fuelType: 'gasoline' as const,
        mileage: 50000,
        price: 25000,
        currency: 'USD' as const,
      };

      const result = vehicleFormSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });
  });
});
