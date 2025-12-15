"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { VehicleFormValidated, ImageGallery } from '@/components/inventory';
import { ConsignmentForm } from '@/components/consignments';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import type { Vehicle, VehiclesListResponse } from '@/types/vehicle';
import type { ApiResponse } from '@/types/auth';
import { Plus, Edit, Trash2, Eye, Car, Calendar, DollarSign, Gauge, Fuel, Settings, MapPin } from 'lucide-react';
import { showToast } from '@/lib/utils/toast';

export default function InventoryPage() {
  const { canEdit, canDelete } = usePermissions();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para el modal de consignación
  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);
  const [consignmentVehicleId, setConsignmentVehicleId] = useState<string | null>(null);

  // Estados para el modal de detalles
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // El backend envuelve en { success: true, data: { data: [], total: ..., page: ... } }
      const response = await apiClient.get<ApiResponse<VehiclesListResponse>>('/vehicles');
      setVehicles(response.data.data);
    } catch (err) {
      setError('Error al cargar los vehículos');
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      available: { variant: 'success', label: 'Disponible' },
      reserved: { variant: 'warning', label: 'Reservado' },
      sold: { variant: 'gray', label: 'Vendido' },
    };

    const config = statusMap[status] || { variant: 'gray', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleOpenCreateModal = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    fetchVehicles();
  };

  const handleOpenDeleteModal = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setVehicleToDelete(null);
  };

  const handleOpenDetailsModal = (vehicle: Vehicle) => {
    setSelectedVehicleDetails(vehicle);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedVehicleDetails(null);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/vehicles/${vehicleToDelete.id}`);
      showToast.success('Vehículo eliminado exitosamente');
      handleCloseDeleteModal();
      fetchVehicles();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      showToast.error('Error al eliminar el vehículo');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-subtle">Cargando vehículos...</p>
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
    <PermissionGuard module="vehicles" action="canView">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main mb-2">
            Inventario de Vehículos
          </h1>
          <p className="text-text-subtle">
            Gestiona el inventario de vehículos disponibles ({vehicles.length} vehículos)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Vehículo
        </Button>
      </div>

      <Card>
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-subtle mb-4">No hay vehículos en el inventario</p>
            <Button variant="primary" onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar primer vehículo
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Vehículo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    VIN
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Año
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Kilometraje
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Precio
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Estado
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-main">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-b border-border-subtle hover:bg-surface-hover transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-text-main">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-sm text-text-subtle">
                          {vehicle.color} · {vehicle.transmission}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-main font-mono">
                      {vehicle.vin}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-main">
                      {vehicle.year}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-main">
                      {vehicle.mileage.toLocaleString()} km
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-text-main">
                      {formatCurrency(vehicle.price, vehicle.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(vehicle.status)}
                        {vehicle.isConsignment && (
                          <Badge variant="primary">Consignación</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 hover:bg-surface-hover rounded-md transition-colors"
                          title="Ver detalles"
                          onClick={() => handleOpenDetailsModal(vehicle)}
                        >
                          <Eye className="w-4 h-4 text-text-subtle" />
                        </button>

                        {canEdit('vehicles') && (
                          <button
                            className="p-2 hover:bg-surface-hover rounded-md transition-colors"
                            title="Editar"
                            onClick={() => handleOpenEditModal(vehicle)}
                          >
                            <Edit className="w-4 h-4 text-text-subtle" />
                          </button>
                        )}

                        {canDelete('vehicles') && (
                          <button
                            className="p-2 hover:bg-surface-hover rounded-md transition-colors"
                            title="Eliminar"
                            onClick={() => handleOpenDeleteModal(vehicle)}
                          >
                            <Trash2 className="w-4 h-4 text-error-main" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
        size="xl"
      >
        <VehicleFormValidated
          vehicle={selectedVehicle}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-main">
            ¿Estás seguro de que deseas eliminar el vehículo{' '}
            <strong>
              {vehicleToDelete?.brand} {vehicleToDelete?.model} {vehicleToDelete?.year}
            </strong>
            ?
          </p>
          <p className="text-sm text-text-subtle">
            Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="outline"
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteVehicle}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Detalles del Vehículo */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        title="Detalles del Vehículo"
        size="xl"
      >
        {selectedVehicleDetails && (
          <div className="space-y-6">
            {/* Header con información principal */}
            <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Car className="w-8 h-8 text-primary-main" />
                  <div>
                    <h2 className="text-2xl font-bold text-text-main">
                      {selectedVehicleDetails.brand} {selectedVehicleDetails.model}
                    </h2>
                    <p className="text-text-subtle">{selectedVehicleDetails.year}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {getStatusBadge(selectedVehicleDetails.status)}
                  {selectedVehicleDetails.isConsignment && (
                    <Badge variant="primary">Consignación</Badge>
                  )}
                  <Badge variant="accent">{selectedVehicleDetails.condition === 'new' ? 'Nuevo' : 'Usado'}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-subtle mb-1">Precio</p>
                <p className="text-3xl font-bold text-primary-main">
                  {formatCurrency(selectedVehicleDetails.price, selectedVehicleDetails.currency)}
                </p>
                {selectedVehicleDetails.cost && selectedVehicleDetails.cost > 0 && (
                  <p className="text-sm text-text-subtle mt-1">
                    Costo: {formatCurrency(selectedVehicleDetails.cost, selectedVehicleDetails.currency)}
                  </p>
                )}
              </div>
            </div>

            {/* Galería de Imágenes */}
            <div>
              <h3 className="font-semibold text-text-main mb-3">Imágenes del Vehículo</h3>
              <ImageGallery
                vehicleId={selectedVehicleDetails.id}
                onUpdate={() => {
                  // Opcional: Recargar detalles del vehículo si es necesario
                }}
              />
            </div>

            {/* VIN */}
            <div className="bg-surface-main p-4 rounded-lg">
              <p className="text-sm font-medium text-text-subtle mb-1">VIN</p>
              <p className="font-mono text-lg font-semibold text-text-main">{selectedVehicleDetails.vin}</p>
            </div>

            {/* Especificaciones Técnicas */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Especificaciones Técnicas</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-surface-main p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-text-subtle" />
                    <p className="text-sm text-text-subtle">Kilometraje</p>
                  </div>
                  <p className="text-lg font-semibold text-text-main">
                    {selectedVehicleDetails.mileage.toLocaleString()} km
                  </p>
                </div>

                <div className="bg-surface-main p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Fuel className="w-4 h-4 text-text-subtle" />
                    <p className="text-sm text-text-subtle">Combustible</p>
                  </div>
                  <p className="text-lg font-semibold text-text-main capitalize">
                    {selectedVehicleDetails.fuelType}
                  </p>
                </div>

                <div className="bg-surface-main p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-text-subtle" />
                    <p className="text-sm text-text-subtle">Transmisión</p>
                  </div>
                  <p className="text-lg font-semibold text-text-main capitalize">
                    {selectedVehicleDetails.transmission === 'automatic' ? 'Automática' :
                     selectedVehicleDetails.transmission === 'manual' ? 'Manual' :
                     selectedVehicleDetails.transmission}
                  </p>
                </div>

                <div className="bg-surface-main p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-4 h-4 text-text-subtle" />
                    <p className="text-sm text-text-subtle">Color</p>
                  </div>
                  <p className="text-lg font-semibold text-text-main capitalize">
                    {selectedVehicleDetails.color}
                  </p>
                </div>

                {selectedVehicleDetails.engineSize && (
                  <div className="bg-surface-main p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-4 h-4 text-text-subtle" />
                      <p className="text-sm text-text-subtle">Motor</p>
                    </div>
                    <p className="text-lg font-semibold text-text-main">
                      {selectedVehicleDetails.engineSize}
                    </p>
                  </div>
                )}

                {selectedVehicleDetails.doors && (
                  <div className="bg-surface-main p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="w-4 h-4 text-text-subtle" />
                      <p className="text-sm text-text-subtle">Puertas</p>
                    </div>
                    <p className="text-lg font-semibold text-text-main">
                      {selectedVehicleDetails.doors}
                    </p>
                  </div>
                )}

                {selectedVehicleDetails.seats && (
                  <div className="bg-surface-main p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="w-4 h-4 text-text-subtle" />
                      <p className="text-sm text-text-subtle">Asientos</p>
                    </div>
                    <p className="text-lg font-semibold text-text-main">
                      {selectedVehicleDetails.seats}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            {selectedVehicleDetails.description && (
              <div>
                <h3 className="font-semibold text-text-main mb-2">Descripción</h3>
                <div className="bg-surface-main p-4 rounded-lg">
                  <p className="text-sm text-text-main whitespace-pre-wrap">
                    {selectedVehicleDetails.description}
                  </p>
                </div>
              </div>
            )}

            {/* Fechas */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Información de Fechas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-main p-4 rounded-lg">
                  <p className="text-sm text-text-subtle mb-1">Creado</p>
                  <p className="text-sm font-medium text-text-main">
                    {new Date(selectedVehicleDetails.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {selectedVehicleDetails.availableFrom && (
                  <div className="bg-surface-main p-4 rounded-lg">
                    <p className="text-sm text-text-subtle mb-1">Disponible desde</p>
                    <p className="text-sm font-medium text-text-main">
                      {new Date(selectedVehicleDetails.availableFrom).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {selectedVehicleDetails.reservedAt && (
                  <div className="bg-surface-main p-4 rounded-lg">
                    <p className="text-sm text-text-subtle mb-1">Reservado</p>
                    <p className="text-sm font-medium text-text-main">
                      {new Date(selectedVehicleDetails.reservedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {selectedVehicleDetails.soldAt && (
                  <div className="bg-surface-main p-4 rounded-lg">
                    <p className="text-sm text-text-subtle mb-1">Vendido</p>
                    <p className="text-sm font-medium text-text-main">
                      {new Date(selectedVehicleDetails.soldAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button variant="outline" onClick={handleCloseDetailsModal}>
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleCloseDetailsModal();
                  handleOpenEditModal(selectedVehicleDetails);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Vehículo
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PermissionGuard>
  );
}
