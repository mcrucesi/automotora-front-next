"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { LocationForm } from '@/components/locations';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import type { Location, LocationsListResponse, ApiResponse } from '@/types';
import { Plus, Edit, Trash2, MapPin, Phone, Mail, User, Building2 } from 'lucide-react';
import { showToast } from '@/lib/utils/toast';

export default function LocationsPage() {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<ApiResponse<LocationsListResponse>>('/locations');
      setLocations(response.data.data);
    } catch (err: any) {
      setError('Error al cargar las sucursales');
      console.error('Error fetching locations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    fetchLocations();
  };

  const handleOpenDeleteModal = (location: Location) => {
    setLocationToDelete(location);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLocationToDelete(null);
  };

  const handleDeleteLocation = async () => {
    if (!locationToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/locations/${locationToDelete.id}`);
      showToast.success('Sucursal desactivada exitosamente');
      handleCloseDeleteModal();
      fetchLocations();
    } catch (err: any) {
      console.error('Error deleting location:', err);
      showToast.error(err.message || 'Error al desactivar la sucursal. Puede que tenga vehículos asignados.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success">Activa</Badge>
    ) : (
      <Badge variant="gray">Inactiva</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-subtle">Cargando sucursales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard module="locations" action="canView">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main mb-2">
            Sucursales
          </h1>
          <p className="text-text-subtle">
            Gestiona las sucursales de tu concesionario ({locations.length} sucursales)
          </p>
        </div>
        {canCreate('locations') && (
          <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Sucursal
          </Button>
        )}
      </div>

      {locations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-text-subtle mx-auto mb-4" />
            <p className="text-text-subtle mb-4">No hay sucursales registradas</p>
            {canCreate('locations') && (
              <Button variant="primary" onClick={handleOpenCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar primera sucursal
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-text-main">
                        {location.name}
                      </h3>
                      {getStatusBadge(location.isActive)}
                    </div>
                    {location.code && (
                      <p className="text-sm text-text-subtle">
                        Código: {location.code}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-4">
                  {/* Dirección */}
                  {(location.address || location.city) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-text-subtle mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-text-main">
                        {location.address && <p>{location.address}</p>}
                        {location.city && (
                          <p>
                            {location.city}
                            {location.state && `, ${location.state}`}
                            {location.zipCode && ` ${location.zipCode}`}
                          </p>
                        )}
                        {location.country && location.country !== 'Colombia' && (
                          <p>{location.country}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Teléfono */}
                  {location.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-text-subtle flex-shrink-0" />
                      <span className="text-sm text-text-main">{location.phone}</span>
                    </div>
                  )}

                  {/* Email */}
                  {location.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-text-subtle flex-shrink-0" />
                      <span className="text-sm text-text-main">{location.email}</span>
                    </div>
                  )}

                  {/* Gerente */}
                  {location.managerName && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-text-subtle flex-shrink-0" />
                      <span className="text-sm text-text-main">
                        Gerente: {location.managerName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border-subtle">
                  {canEdit('locations') && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEditModal(location)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  {canDelete('locations') && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenDeleteModal(location)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
      >
        <LocationForm
          location={selectedLocation}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        size="sm"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-text-main mb-4">
            Desactivar Sucursal
          </h3>
          <p className="text-text-main mb-6">
            ¿Estás seguro que deseas desactivar la sucursal{' '}
            <strong>{locationToDelete?.name}</strong>?
          </p>
          <p className="text-sm text-text-subtle mb-6">
            Esta acción no se puede deshacer si la sucursal tiene vehículos asignados.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteLocation}
              disabled={isDeleting}
            >
              {isDeleting ? 'Desactivando...' : 'Desactivar'}
            </Button>
          </div>
        </div>
      </Modal>
    </PermissionGuard>
  );
}
