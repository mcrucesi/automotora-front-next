"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui';
import { ImageUploader } from './ImageUploader';
import { ImageGallery } from './ImageGallery';
import { vehicleFormSchema, type VehicleFormData } from '@/lib/validations';
import type { Vehicle, CreateVehicleDto } from '@/types/vehicle';
import type { Location, LocationsListResponse } from '@/types/location';
import type { ApiResponse } from '@/types';
import { apiClient } from '@/lib/api/client';
import { showToast } from '@/lib/utils/toast';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const VehicleFormValidated = ({ vehicle, onSuccess, onCancel }: VehicleFormProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [imageGalleryKey, setImageGalleryKey] = useState(0);

  // Configurar React Hook Form con Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vin: vehicle?.vin || '',
      brand: vehicle?.brand || '',
      model: vehicle?.model || '',
      year: vehicle?.year || new Date().getFullYear(),
      condition: vehicle?.condition || 'used',
      price: vehicle?.price || 0,
      cost: vehicle?.cost || 0,
      currency: vehicle?.currency || 'CLP',
      mileage: vehicle?.mileage || 0,
      color: vehicle?.color || '',
      fuelType: vehicle?.fuelType || 'gasoline',
      transmission: vehicle?.transmission || 'automatic',
      engineSize: vehicle?.engineSize || '',
      doors: vehicle?.doors || 4,
      seats: vehicle?.seats || 5,
      description: vehicle?.description || '',
      locationId: vehicle?.locationId || '',
      isConsignment: vehicle?.isConsignment || false,
    },
  });

  // Watch isConsignment para mostrar el mensaje
  const isConsignment = watch('isConsignment');

  useEffect(() => {
    fetchLocations();
  }, []);

  // Resetear el formulario cuando cambia el vehículo
  useEffect(() => {
    if (vehicle) {
      reset({
        vin: vehicle.vin || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        condition: vehicle.condition || 'used',
        price: vehicle.price || 0,
        cost: vehicle.cost || 0,
        currency: vehicle.currency || 'CLP',
        mileage: vehicle.mileage || 0,
        color: vehicle.color || '',
        fuelType: vehicle.fuelType || 'gasoline',
        transmission: vehicle.transmission || 'automatic',
        engineSize: vehicle.engineSize || '',
        doors: vehicle.doors || 4,
        seats: vehicle.seats || 5,
        description: vehicle.description || '',
        locationId: vehicle.locationId || '',
        isConsignment: vehicle.isConsignment || false,
      });
    }
  }, [vehicle, reset]);

  const fetchLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const response = await apiClient.get<ApiResponse<LocationsListResponse>>('/locations');
      const activeLocations = response.data.data.filter(loc => loc.isActive);
      setLocations(activeLocations);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      // Limpiar campos opcionales: convertir strings vacíos en undefined
      const cleanData = {
        ...data,
        locationId: data.locationId || undefined,
        engineSize: data.engineSize || undefined,
        description: data.description || undefined,
        cost: data.cost || undefined,
      };

      if (vehicle) {
        // Al actualizar, omitir el VIN porque no se puede modificar
        const { vin, ...updateData } = cleanData;
        await apiClient.patch(`/vehicles/${vehicle.id}`, updateData);
        showToast.success('Vehículo actualizado exitosamente');
      } else {
        // Al crear, enviar todos los datos incluyendo el VIN
        await apiClient.post('/vehicles', cleanData);
        showToast.success('Vehículo creado exitosamente');
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error al guardar el vehículo:', err);
      showToast.error(err.message || 'Error al guardar el vehículo');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información Básica */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Información Básica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              VIN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('vin')}
              disabled={!!vehicle}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.vin ? 'border-red-500' : 'border-border-subtle'
              }`}
              placeholder="1HGBH41JXMN109186"
            />
            {vehicle && (
              <p className="mt-1 text-xs text-text-subtle">El VIN no se puede modificar después de crear el vehículo</p>
            )}
            {errors.vin && (
              <p className="mt-1 text-sm text-red-600">{errors.vin.message}</p>
            )}
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('brand')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.brand ? 'border-red-500' : 'border-border-subtle'
              }`}
              placeholder="Toyota"
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
            )}
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Modelo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('model')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.model ? 'border-red-500' : 'border-border-subtle'
              }`}
              placeholder="Corolla"
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
            )}
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Año <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('year', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.year ? 'border-red-500' : 'border-border-subtle'
              }`}
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('color')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.color ? 'border-red-500' : 'border-border-subtle'
              }`}
              placeholder="Blanco"
            />
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
            )}
          </div>

          {/* Condición */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Condición <span className="text-red-500">*</span>
            </label>
            <select
              {...register('condition')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.condition ? 'border-red-500' : 'border-border-subtle'
              }`}
            >
              <option value="new">Nuevo</option>
              <option value="used">Usado</option>
              <option value="certified">Certificado</option>
            </select>
            {errors.condition && (
              <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Ubicación
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Sucursal
            </label>
            <select
              {...register('locationId')}
              disabled={isLoadingLocations}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.locationId ? 'border-red-500' : 'border-border-subtle'
              }`}
            >
              <option value="">Sin asignar</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} {location.city ? `- ${location.city}` : ''}
                </option>
              ))}
            </select>
            {isLoadingLocations && (
              <p className="text-xs text-text-subtle mt-1">Cargando sucursales...</p>
            )}
          </div>
        </div>
      </div>

      {/* Consignación */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Tipo de Vehículo
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isConsignment"
              {...register('isConsignment')}
              className="w-4 h-4 text-primary-main bg-gray-100 border-gray-300 rounded focus:ring-primary-main focus:ring-2"
            />
            <label htmlFor="isConsignment" className="ml-3 text-sm font-medium text-text-main">
              Este vehículo está en consignación
            </label>
          </div>
          {isConsignment && (
            <div className="ml-7 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los vehículos en consignación requieren crear un acuerdo de consignación en la sección de Consignaciones después de guardar el vehículo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Especificaciones */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Especificaciones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transmisión */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Transmisión <span className="text-red-500">*</span>
            </label>
            <select
              {...register('transmission')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.transmission ? 'border-red-500' : 'border-border-subtle'
              }`}
            >
              <option value="automatic">Automática</option>
              <option value="manual">Manual</option>
              <option value="cvt">CVT</option>
              <option value="semi-automatic">Semi-automática</option>
            </select>
            {errors.transmission && (
              <p className="mt-1 text-sm text-red-600">{errors.transmission.message}</p>
            )}
          </div>

          {/* Tipo de Combustible */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Tipo de Combustible <span className="text-red-500">*</span>
            </label>
            <select
              {...register('fuelType')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.fuelType ? 'border-red-500' : 'border-border-subtle'
              }`}
            >
              <option value="gasoline">Gasolina</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Eléctrico</option>
              <option value="hybrid">Híbrido</option>
              <option value="plug-in-hybrid">Híbrido Enchufable</option>
            </select>
            {errors.fuelType && (
              <p className="mt-1 text-sm text-red-600">{errors.fuelType.message}</p>
            )}
          </div>

          {/* Tamaño del Motor */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Tamaño del Motor
            </label>
            <input
              type="text"
              {...register('engineSize')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.engineSize ? 'border-red-500' : 'border-border-subtle'
              }`}
              placeholder="2.0L"
            />
            {errors.engineSize && (
              <p className="mt-1 text-sm text-red-600">{errors.engineSize.message}</p>
            )}
          </div>

          {/* Kilometraje */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Kilometraje <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('mileage', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.mileage ? 'border-red-500' : 'border-border-subtle'
              }`}
              placeholder="50000"
            />
            {errors.mileage && (
              <p className="mt-1 text-sm text-red-600">{errors.mileage.message}</p>
            )}
          </div>

          {/* Puertas */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Puertas
            </label>
            <input
              type="number"
              {...register('doors', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.doors ? 'border-red-500' : 'border-border-subtle'
              }`}
            />
            {errors.doors && (
              <p className="mt-1 text-sm text-red-600">{errors.doors.message}</p>
            )}
          </div>

          {/* Asientos */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Asientos
            </label>
            <input
              type="number"
              {...register('seats', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.seats ? 'border-red-500' : 'border-border-subtle'
              }`}
            />
            {errors.seats && (
              <p className="mt-1 text-sm text-red-600">{errors.seats.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Precios */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Información de Precios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Precio de Venta */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Precio de Venta <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.price ? 'border-red-500' : 'border-border-subtle'
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Costo */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Costo
            </label>
            <input
              type="number"
              step="0.01"
              {...register('cost', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.cost ? 'border-red-500' : 'border-border-subtle'
              }`}
            />
            {errors.cost && (
              <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
            )}
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Moneda <span className="text-red-500">*</span>
            </label>
            <select
              {...register('currency')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
                errors.currency ? 'border-red-500' : 'border-border-subtle'
              }`}
            >
              <option value="CLP">CLP (Peso Chileno)</option>
              <option value="USD">USD (Dólar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="MXN">MXN (Peso Mexicano)</option>
              <option value="COP">COP (Peso Colombiano)</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Descripción
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
            errors.description ? 'border-red-500' : 'border-border-subtle'
          }`}
          placeholder="Descripción detallada del vehículo..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Gestión de Imágenes - Solo visible cuando editamos un vehículo existente */}
      {vehicle && (
        <div className="border-t border-border-subtle pt-6">
          <h3 className="text-lg font-semibold text-text-main mb-4">
            Gestión de Imágenes
          </h3>

          <div className="space-y-6">
            {/* Subir nuevas imágenes */}
            <div>
              <h4 className="text-sm font-medium text-text-main mb-3">
                Subir Nuevas Imágenes
              </h4>
              <ImageUploader
                vehicleId={vehicle.id}
                onSuccess={() => {
                  // Forzar re-render de ImageGallery
                  setImageGalleryKey(prev => prev + 1);
                }}
              />
            </div>

            {/* Galería de imágenes existentes */}
            <div>
              <h4 className="text-sm font-medium text-text-main mb-3">
                Imágenes Actuales
              </h4>
              <ImageGallery
                key={imageGalleryKey}
                vehicleId={vehicle.id}
                onUpdate={() => {
                  // Opcional: hacer algo cuando se actualiza una imagen
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : vehicle ? 'Actualizar' : 'Crear'} Vehículo
        </Button>
      </div>
    </form>
  );
};
