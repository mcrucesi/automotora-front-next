"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { apiClient } from '@/lib/api/client';
import type { Location, CreateLocationDto, UpdateLocationDto, ApiResponse } from '@/types';
import { X } from 'lucide-react';
import { showToast } from '@/lib/utils/toast';

interface LocationFormProps {
  location?: Location | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LocationForm({ location, onSuccess, onCancel }: LocationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateLocationDto>({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Colombia',
    phone: '',
    email: '',
    managerName: '',
  });

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        code: location.code || '',
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        zipCode: location.zipCode || '',
        country: location.country || 'Colombia',
        phone: location.phone || '',
        email: location.email || '',
        managerName: location.managerName || '',
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Limpiar campos vacíos
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      ) as CreateLocationDto;

      if (location) {
        // Actualizar
        await apiClient.patch<ApiResponse<Location>>(
          `/locations/${location.id}`,
          cleanedData as UpdateLocationDto
        );
        showToast.success('Sucursal actualizada exitosamente');
      } else {
        // Crear
        await apiClient.post<ApiResponse<Location>>('/locations', cleanedData);
        showToast.success('Sucursal creada exitosamente');
      }

      onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Error al guardar la sucursal';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <h3 className="text-xl font-bold text-text-main">
          {location ? 'Editar Sucursal' : 'Nueva Sucursal'}
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

      <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
        {/* Información Básica */}
        <div className="space-y-4">
          <h4 className="font-semibold text-text-main text-sm uppercase tracking-wide">
            Información Básica
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Nombre de la Sucursal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Sucursal Centro"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Código (Opcional)
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ej: SUC-001"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-4">
          <h4 className="font-semibold text-text-main text-sm uppercase tracking-wide pt-4">
            Dirección
          </h4>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Dirección Completa
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ej: Calle 123 #45-67"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Ciudad
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ej: Bogotá"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Estado/Departamento
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Ej: Cundinamarca"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Código Postal
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Ej: 110111"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              País
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Ej: Colombia"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <h4 className="font-semibold text-text-main text-sm uppercase tracking-wide pt-4">
            Información de Contacto
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej: +57 301 234 5678"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ej: centro@dealership.com"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Nombre del Gerente
            </label>
            <input
              type="text"
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

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
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : location ? 'Actualizar' : 'Crear Sucursal'}
        </Button>
      </div>
    </form>
  );
}
