"use client";

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui';
import type { CreateCustomerDto, Customer, CustomerSource, CustomerType } from '@/types/customer';
import { apiClient } from '@/lib/api/client';
import { showToast } from '@/lib/utils/toast';

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomerForm = ({ customer, onSuccess, onCancel }: CustomerFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCustomerDto>({
    type: (customer?.type as CustomerType) || 'buyer',
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    secondaryPhone: customer?.secondaryPhone || '',
    source: (customer?.source as CustomerSource) || 'web',
    budgetMin: customer?.budgetMin || undefined,
    budgetMax: customer?.budgetMax || undefined,
    notes: customer?.notes || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Preparar datos - eliminar campos opcionales vacíos
      const submitData: any = { ...formData };

      if (!submitData.email || submitData.email.trim() === '') delete submitData.email;
      if (!submitData.secondaryPhone || submitData.secondaryPhone.trim() === '') delete submitData.secondaryPhone;
      if (!submitData.budgetMin) delete submitData.budgetMin;
      if (!submitData.budgetMax) delete submitData.budgetMax;
      if (!submitData.notes || submitData.notes.trim() === '') delete submitData.notes;

      console.log('Datos a enviar:', submitData);

      if (customer) {
        await apiClient.patch(`/customers/${customer.id}`, submitData);
        showToast.success('Cliente actualizado exitosamente');
      } else {
        await apiClient.post('/customers', submitData);
        showToast.success('Cliente creado exitosamente');
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error completo:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Error al guardar el cliente';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Información Básica */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Información Básica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Juan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Tipo
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="buyer">Comprador</option>
              <option value="consigner">Consignador</option>
              <option value="both">Ambos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Fuente <span className="text-red-500">*</span>
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="web">Sitio Web</option>
              <option value="phone">Teléfono</option>
              <option value="email">Email</option>
              <option value="referral">Referido</option>
              <option value="walk_in">Visita Presencial</option>
              <option value="social_media">Redes Sociales</option>
              <option value="advertisement">Publicidad</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Información de Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="+57 300 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Teléfono Secundario
            </label>
            <input
              type="tel"
              name="secondaryPhone"
              value={formData.secondaryPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="+57 310 987 6543"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-main mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="juan.perez@email.com"
            />
          </div>
        </div>
      </div>

      {/* Presupuesto */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Presupuesto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Presupuesto Mínimo
            </label>
            <input
              type="number"
              name="budgetMin"
              value={formData.budgetMin || ''}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Presupuesto Máximo
            </label>
            <input
              type="number"
              name="budgetMax"
              value={formData.budgetMax || ''}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="25000"
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
          placeholder="Información adicional sobre el cliente..."
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : customer ? 'Actualizar' : 'Crear'} Cliente
        </Button>
      </div>
    </form>
  );
};
