"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { apiClient } from '@/lib/api/client';
import type {
  Consignment,
  CreateConsignmentDto,
  UpdateConsignmentDto,
  CommissionType
} from '@/types/consignment';
import type { Vehicle } from '@/types/vehicle';
import type { Customer } from '@/types/customer';
import type { ApiResponse } from '@/types';
import { X } from 'lucide-react';
import { showToast } from '@/lib/utils/toast';

interface ConsignmentFormProps {
  consignment?: Consignment | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConsignmentForm({ consignment, onSuccess, onCancel }: ConsignmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState<CreateConsignmentDto>({
    vehicleId: '',
    ownerId: '',
    agreedPrice: 0,
    minimumPrice: 0,
    commissionType: 'percentage' as CommissionType,
    commissionValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchInitialData();
    if (consignment) {
      setFormData({
        vehicleId: consignment.vehicleId,
        ownerId: consignment.ownerId,
        agreedPrice: consignment.agreedPrice,
        minimumPrice: consignment.minimumPrice || 0,
        commissionType: consignment.commissionType,
        commissionValue: consignment.commissionValue,
        startDate: consignment.startDate.split('T')[0],
        expiryDate: consignment.expiryDate ? consignment.expiryDate.split('T')[0] : '',
        notes: consignment.notes || '',
      });
    }
  }, [consignment]);

  const fetchInitialData = async () => {
    try {
      setIsLoadingData(true);
      const [vehiclesRes, customersRes] = await Promise.all([
        apiClient.get<ApiResponse<{ data: Vehicle[] }>>('/vehicles'),
        apiClient.get<ApiResponse<{ data: Customer[] }>>('/customers'),
      ]);

      // Filtrar solo vehículos disponibles y marcados como consignación
      const consignmentVehicles = vehiclesRes.data.data.filter(
        v => v.isConsignment && v.status === 'available'
      );
      setVehicles(consignmentVehicles);
      setCustomers(customersRes.data.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar vehículos y clientes');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Limpiar campos vacíos
      const cleanedData: any = {
        ...formData,
        agreedPrice: Number(formData.agreedPrice),
        minimumPrice: formData.minimumPrice ? Number(formData.minimumPrice) : undefined,
        commissionValue: Number(formData.commissionValue),
      };

      if (!cleanedData.expiryDate) delete cleanedData.expiryDate;
      if (!cleanedData.notes) delete cleanedData.notes;

      if (consignment) {
        // Actualizar
        await apiClient.patch<ApiResponse<Consignment>>(
          `/consignments/${consignment.id}`,
          cleanedData as UpdateConsignmentDto
        );
        showToast.success('Consignación actualizada exitosamente');
      } else {
        // Crear
        await apiClient.post<ApiResponse<Consignment>>('/consignments', cleanedData);
        showToast.success('Consignación creada exitosamente');
      }

      onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Error al guardar la consignación';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <h3 className="text-xl font-bold text-text-main">
          {consignment ? 'Editar Consignación' : 'Nueva Consignación'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-text-subtle hover:text-text-main transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoadingData ? (
        <div className="py-8 text-center text-text-subtle">
          Cargando datos...
        </div>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
          {/* Vehículo y Propietario */}
          <div className="space-y-4">
            <h4 className="font-semibold text-text-main text-sm uppercase tracking-wide">
              Información Básica
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Vehículo <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  required
                  disabled={!!consignment}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.vin}
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <p className="text-xs text-text-subtle mt-1">
                    No hay vehículos disponibles marcados como consignación
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Propietario <span className="text-red-500">*</span>
                </label>
                <select
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar propietario</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} - {customer.phone || customer.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="space-y-4">
            <h4 className="font-semibold text-text-main text-sm uppercase tracking-wide pt-4">
              Información de Precios
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Precio Acordado <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="agreedPrice"
                  value={formData.agreedPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Precio Mínimo
                </label>
                <input
                  type="number"
                  name="minimumPrice"
                  value={formData.minimumPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="23000"
                />
              </div>
            </div>
          </div>

          {/* Comisión */}
          <div className="space-y-4">
            <h4 className="font-semibold text-text-main text-sm uppercase tracking-wide pt-4">
              Comisión
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Tipo de Comisión <span className="text-red-500">*</span>
                </label>
                <select
                  name="commissionType"
                  value={formData.commissionType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Monto Fijo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Valor de Comisión <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="commissionValue"
                  value={formData.commissionValue}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={formData.commissionType === 'percentage' ? '10' : '2000'}
                />
                <p className="text-xs text-text-subtle mt-1">
                  {formData.commissionType === 'percentage'
                    ? 'Porcentaje de comisión (ej: 10 para 10%)'
                    : 'Monto fijo en USD'}
                </p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="space-y-4">
            <h4 className="font-semibold text-text-main text-sm uppercase tracking-wide pt-4">
              Fechas
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Fecha de Expiración
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-4">
            <h4 className="font-semibold text-text-main text-sm uppercase tracking-wide pt-4">
              Notas Adicionales
            </h4>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Detalles adicionales del acuerdo de consignación..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || isLoadingData}
        >
          {isLoading ? 'Guardando...' : consignment ? 'Actualizar' : 'Crear Consignación'}
        </Button>
      </div>
    </form>
  );
}
