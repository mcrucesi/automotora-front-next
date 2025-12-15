"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui';
import { CreateSaleDto, Sale, PaymentMethod } from '@/types/sale';
import type { Vehicle } from '@/types/vehicle';
import type { Customer } from '@/types/customer';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/auth';
import { showToast } from '@/lib/utils/toast';

interface SaleFormProps {
  sale?: Sale | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SaleForm = ({ sale, onSuccess, onCancel }: SaleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState<CreateSaleDto>({
    vehicleId: sale?.vehicleId || '',
    customerId: sale?.customerId || '',
    salePrice: sale?.salePrice || 0,
    discount: sale?.discount || 0,
    commissionRate: sale?.commissionRate || 5,
    paymentMethod: sale?.paymentMethod || PaymentMethod.CASH,
    downPayment: sale?.downPayment,
    financingMonths: sale?.financingMonths,
    monthlyPayment: sale?.monthlyPayment,
    notes: sale?.notes || '',
    soldAt: sale?.saleDate ? new Date(sale.saleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    deliveryDate: sale?.deliveryDate ? new Date(sale.deliveryDate).toISOString().split('T')[0] : undefined,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoadingData(true);
      const [vehiclesRes, customersRes] = await Promise.all([
        apiClient.get<ApiResponse<{ data: Vehicle[] }>>('/vehicles'),
        apiClient.get<ApiResponse<{ data: Customer[] }>>('/customers'),
      ]);

      // Filtrar solo vehículos disponibles si no estamos editando
      const availableVehicles = sale
        ? vehiclesRes.data.data
        : vehiclesRes.data.data.filter(v => v.status === 'available');

      console.log('Vehículos disponibles:', availableVehicles);
      console.log('Clientes disponibles:', customersRes.data.data);

      setVehicles(availableVehicles);
      setCustomers(customersRes.data.data);

      if (availableVehicles.length === 0) {
        setError('No hay vehículos disponibles. Por favor, agrega vehículos al inventario primero.');
      }
      if (customersRes.data.data.length === 0) {
        setError('No hay clientes registrados. Por favor, agrega clientes en el CRM primero.');
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Error al cargar vehículos y clientes');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = e.target.value;
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);

    setFormData(prev => ({
      ...prev,
      vehicleId,
      // Auto-populate sale price from vehicle price
      salePrice: selectedVehicle?.price || prev.salePrice,
    }));
  };

  const calculateMonthlyPayment = () => {
    if (!formData.downPayment || !formData.financingMonths) return;

    const financedAmount = formData.salePrice - (formData.discount || 0) - formData.downPayment;
    const monthlyPayment = financedAmount / formData.financingMonths;

    setFormData(prev => ({
      ...prev,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    }));
  };

  useEffect(() => {
    if (formData.paymentMethod === 'financing') {
      calculateMonthlyPayment();
    }
  }, [formData.downPayment, formData.financingMonths, formData.salePrice, formData.discount]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Preparar datos - eliminar campos opcionales vacíos
      const submitData: any = { ...formData };

      // Convertir fechas a formato ISO completo
      if (submitData.soldAt) {
        submitData.soldAt = new Date(submitData.soldAt).toISOString();
      }
      if (submitData.deliveryDate) {
        submitData.deliveryDate = new Date(submitData.deliveryDate).toISOString();
      }

      // Eliminar campos opcionales vacíos o 0
      if (!submitData.discount || submitData.discount === 0) delete submitData.discount;
      if (!submitData.downPayment) delete submitData.downPayment;
      if (!submitData.financingMonths) delete submitData.financingMonths;
      if (!submitData.monthlyPayment) delete submitData.monthlyPayment;
      if (!submitData.deliveryDate) delete submitData.deliveryDate;
      if (!submitData.notes || submitData.notes.trim() === '') delete submitData.notes;
      // Mantener commissionRate incluso si es 0 (puede ser válido)

      console.log('Datos a enviar:', submitData);

      if (sale) {
        await apiClient.patch(`/sales/${sale.id}`, submitData);
        showToast.success('Venta actualizada exitosamente');
      } else {
        await apiClient.post('/sales', submitData);
        showToast.success('Venta creada exitosamente');
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error completo:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Error al guardar la venta';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-text-subtle">Cargando datos...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Selección de Vehículo y Cliente */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Información Básica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Vehículo <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleVehicleChange}
              required
              disabled={!!sale}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona un vehículo</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.vin}
                </option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <p className="text-sm text-text-subtle mt-1">
                No hay vehículos disponibles
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
              disabled={!!sale}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona un cliente</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName} - {customer.email || customer.phone}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-sm text-text-subtle mt-1">
                No hay clientes registrados
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Información Financiera */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Información Financiera
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Precio de Venta <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Descuento
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Tasa de Comisión (%)
            </label>
            <input
              type="number"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              placeholder="5"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>
        </div>

        {/* Total calculado */}
        <div className="mt-4 p-4 bg-surface-main rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-text-subtle">Total Final:</span>
            <span className="text-xl font-bold text-text-main">
              ${(formData.salePrice - (formData.discount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-text-subtle">Comisión ({formData.commissionRate}%):</span>
            <span className="text-sm font-semibold text-accent-main">
              ${(formData.salePrice * (formData.commissionRate / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Método de Pago */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Método de Pago
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Método <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="cash">Efectivo</option>
              <option value="credit_card">Tarjeta de Crédito</option>
              <option value="debit_card">Tarjeta de Débito</option>
              <option value="bank_transfer">Transferencia Bancaria</option>
              <option value="financing">Financiamiento</option>
              <option value="mixed">Mixto</option>
            </select>
          </div>

          {/* Campos de Financiamiento */}
          {formData.paymentMethod === 'financing' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary-light rounded-lg">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Enganche <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="downPayment"
                  value={formData.downPayment || ''}
                  onChange={handleChange}
                  required={formData.paymentMethod === 'financing'}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Meses <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="financingMonths"
                  value={formData.financingMonths || ''}
                  onChange={handleChange}
                  required={formData.paymentMethod === 'financing'}
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Pago Mensual
                </label>
                <input
                  type="number"
                  name="monthlyPayment"
                  value={formData.monthlyPayment || ''}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-border-subtle rounded-md bg-gray-50"
                  placeholder="Calculado automáticamente"
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fechas */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Fechas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Fecha de Venta <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="soldAt"
              value={formData.soldAt}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Fecha de Entrega
            </label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Notas
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
          placeholder="Notas adicionales sobre la venta..."
        />
      </div>

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
          disabled={isSubmitting || vehicles.length === 0 || customers.length === 0}
        >
          {isSubmitting ? 'Guardando...' : sale ? 'Actualizar' : 'Crear'} Venta
        </Button>
      </div>
    </form>
  );
};
