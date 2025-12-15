"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { ConsignmentForm } from '@/components/consignments';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import type {
  Consignment,
  ConsignmentsListResponse,
  ConsignmentStatus
} from '@/types/consignment';
import type { ApiResponse } from '@/types';
import { Plus, Edit, Eye, Calendar, DollarSign, User, Car, FileText, Handshake, Trash2, AlertTriangle, Filter } from 'lucide-react';
import { showToast } from '@/lib/utils/toast';

export default function ConsignmentsPage() {
  const { canEdit, canDelete, canEditResource, canDeleteResource } = usePermissions();
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ConsignmentStatus | ''>('');

  useEffect(() => {
    fetchConsignments();
  }, [statusFilter]);

  const fetchConsignments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const response = await apiClient.get<ApiResponse<ConsignmentsListResponse>>('/consignments', { params });
      setConsignments(response.data.data);
    } catch (err: any) {
      setError('Error al cargar las consignaciones');
      console.error('Error fetching consignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedConsignment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConsignment(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    fetchConsignments();
  };

  const handleOpenDetailsModal = (consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedConsignment(null);
  };

  const handleOpenDeleteModal = (consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedConsignment(null);
  };

  const handleDeleteConsignment = async () => {
    if (!selectedConsignment) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/consignments/${selectedConsignment.id}`);
      showToast.success('Consignación eliminada exitosamente');
      handleCloseDeleteModal();
      fetchConsignments();
    } catch (err: any) {
      console.error('Error deleting consignment:', err);
      showToast.error(err.message || 'Error al eliminar la consignación');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: ConsignmentStatus) => {
    const statusMap: Record<ConsignmentStatus, { variant: any; label: string }> = {
      active: { variant: 'success', label: 'Activa' },
      expired: { variant: 'warning', label: 'Expirada' },
      sold: { variant: 'primary', label: 'Vendida' },
      cancelled: { variant: 'error', label: 'Cancelada' },
    };

    const config = statusMap[status] || { variant: 'gray', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateCommission = (agreedPrice: number, commissionType: string, commissionValue: number) => {
    if (commissionType === 'percentage') {
      return agreedPrice * (commissionValue / 100);
    }
    return commissionValue;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-subtle">Cargando consignaciones...</p>
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
    <PermissionGuard module="consignments" action="canView">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main mb-2">
              Consignaciones
            </h1>
            <p className="text-text-subtle">
              Gestiona los vehículos en consignación ({consignments.length} consignaciones)
            </p>
          </div>
          <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Consignación
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-subtle" />
              <span className="text-sm font-medium text-text-main">Filtrar por:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ConsignmentStatus | '')}
              className="px-3 py-2 border border-border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="expired">Expiradas</option>
              <option value="sold">Vendidas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </Card>
      </div>

      {consignments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Handshake className="w-16 h-16 text-text-subtle mx-auto mb-4" />
            <p className="text-text-subtle mb-4">No hay consignaciones registradas</p>
            <Button variant="primary" onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera consignación
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {consignments.map((consignment) => (
            <Card key={consignment.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-text-main">
                            {consignment.vehicle?.brand} {consignment.vehicle?.model} {consignment.vehicle?.year}
                          </h3>
                          {getStatusBadge(consignment.status)}
                        </div>
                        {consignment.vehicle?.vin && (
                          <p className="text-sm text-text-subtle font-mono">
                            VIN: {consignment.vehicle.vin}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {/* Propietario */}
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-text-subtle mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-text-subtle">Propietario</p>
                          <p className="font-medium text-text-main">
                            {consignment.owner?.fullName || 'Sin datos'}
                          </p>
                        </div>
                      </div>

                      {/* Precio Acordado */}
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-text-subtle mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-text-subtle">Precio Acordado</p>
                          <p className="font-semibold text-text-main">
                            {formatCurrency(consignment.agreedPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Comisión */}
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-text-subtle mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-text-subtle">Comisión</p>
                          <p className="font-medium text-text-main">
                            {consignment.commissionType === 'percentage'
                              ? `${consignment.commissionValue}% (${formatCurrency(
                                  calculateCommission(
                                    consignment.agreedPrice,
                                    consignment.commissionType,
                                    consignment.commissionValue
                                  )
                                )})`
                              : formatCurrency(consignment.commissionValue)}
                          </p>
                        </div>
                      </div>

                      {/* Fecha de Inicio */}
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-text-subtle mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-text-subtle">Fecha de Inicio</p>
                          <p className="font-medium text-text-main">
                            {formatDate(consignment.startDate)}
                          </p>
                        </div>
                      </div>

                      {/* Fecha de Expiración */}
                      {consignment.expiryDate && (
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-text-subtle mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-text-subtle">Expira</p>
                            <p className="font-medium text-text-main">
                              {formatDate(consignment.expiryDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Precio Mínimo */}
                      {consignment.minimumPrice && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-text-subtle mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-text-subtle">Precio Mínimo</p>
                            <p className="font-medium text-text-main">
                              {formatCurrency(consignment.minimumPrice)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetailsModal(consignment)}
                    >
                      <Eye size={16} className="mr-1" />
                      Ver
                    </Button>
                    {consignment.status === 'active' && canEdit('consignments') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(consignment)}
                      >
                        <Edit size={16} className="mr-1" />
                        Editar
                      </Button>
                    )}
                    {canDelete('consignments') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(consignment)}
                        className="text-error-main hover:bg-error-subtle"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="xl"
      >
        <ConsignmentForm
          consignment={selectedConsignment}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Modal Details */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        size="lg"
      >
        {selectedConsignment && (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-2xl font-bold text-text-main">
                  {selectedConsignment.vehicle?.brand} {selectedConsignment.vehicle?.model} {selectedConsignment.vehicle?.year}
                </h2>
                <p className="text-sm text-text-subtle font-mono mt-1">
                  {selectedConsignment.vehicle?.vin}
                </p>
              </div>
              {getStatusBadge(selectedConsignment.status)}
            </div>

            {/* Vehicle Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Vehículo</h3>
              </div>
              <div className="bg-surface-main p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Marca y Modelo:</span>
                  <span className="text-sm font-medium text-text-main">
                    {selectedConsignment.vehicle?.brand} {selectedConsignment.vehicle?.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Año:</span>
                  <span className="text-sm font-medium text-text-main">
                    {selectedConsignment.vehicle?.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Color:</span>
                  <span className="text-sm font-medium text-text-main">
                    {selectedConsignment.vehicle?.color}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Propietario</h3>
              </div>
              <div className="bg-surface-main p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Nombre:</span>
                  <span className="text-sm font-medium text-text-main">
                    {selectedConsignment.owner?.fullName}
                  </span>
                </div>
                {selectedConsignment.owner?.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-subtle">Teléfono:</span>
                    <span className="text-sm font-medium text-text-main">
                      {selectedConsignment.owner.phone}
                    </span>
                  </div>
                )}
                {selectedConsignment.owner?.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-subtle">Email:</span>
                    <span className="text-sm font-medium text-text-main">
                      {selectedConsignment.owner.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Información Financiera</h3>
              </div>
              <div className="bg-surface-main p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Precio Acordado:</span>
                  <span className="text-lg font-semibold text-text-main">
                    {formatCurrency(selectedConsignment.agreedPrice)}
                  </span>
                </div>
                {selectedConsignment.minimumPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-subtle">Precio Mínimo:</span>
                    <span className="text-sm font-medium text-text-main">
                      {formatCurrency(selectedConsignment.minimumPrice)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border-subtle">
                  <span className="text-sm text-text-subtle">Comisión:</span>
                  <span className="text-sm font-semibold text-accent-main">
                    {selectedConsignment.commissionType === 'percentage'
                      ? `${selectedConsignment.commissionValue}% = ${formatCurrency(
                          calculateCommission(
                            selectedConsignment.agreedPrice,
                            selectedConsignment.commissionType,
                            selectedConsignment.commissionValue
                          )
                        )}`
                      : formatCurrency(selectedConsignment.commissionValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Pago al Propietario:</span>
                  <span className="text-sm font-semibold text-text-main">
                    {formatCurrency(
                      selectedConsignment.agreedPrice -
                        calculateCommission(
                          selectedConsignment.agreedPrice,
                          selectedConsignment.commissionType,
                          selectedConsignment.commissionValue
                        )
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Fechas</h3>
              </div>
              <div className="bg-surface-main p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Fecha de Acuerdo:</span>
                  <span className="text-sm font-medium text-text-main">
                    {formatDate(selectedConsignment.agreementDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Fecha de Inicio:</span>
                  <span className="text-sm font-medium text-text-main">
                    {formatDate(selectedConsignment.startDate)}
                  </span>
                </div>
                {selectedConsignment.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-subtle">Fecha de Expiración:</span>
                    <span className="text-sm font-medium text-text-main">
                      {formatDate(selectedConsignment.expiryDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedConsignment.notes && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary-main" />
                  <h3 className="font-semibold text-text-main">Notas</h3>
                </div>
                <div className="bg-surface-main p-4 rounded-lg">
                  <p className="text-sm text-text-main whitespace-pre-wrap">
                    {selectedConsignment.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button variant="outline" onClick={handleCloseDetailsModal}>
                Cerrar
              </Button>
              {selectedConsignment.status === 'active' && canEdit('consignments') && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleCloseDetailsModal();
                    handleOpenEditModal(selectedConsignment);
                  }}
                >
                  <Edit size={16} className="mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Eliminar Consignación"
        size="md"
      >
        {selectedConsignment && (
          <div className="space-y-4">
            {/* Warning Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Warning Message */}
            <div className="text-center">
              <p className="text-lg font-semibold text-text-main mb-2">
                ¿Estás seguro de eliminar esta consignación?
              </p>
              <p className="text-sm text-text-subtle">
                Esta acción no se puede deshacer. El vehículo volverá a estar disponible en el inventario.
              </p>
            </div>

            {/* Consignment Details */}
            <div className="bg-surface-secondary rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-text-subtle">Vehículo:</span>
                <span className="text-sm text-text-main font-semibold text-right">
                  {selectedConsignment.vehicle?.brand} {selectedConsignment.vehicle?.model} {selectedConsignment.vehicle?.year}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-text-subtle">Propietario:</span>
                <span className="text-sm text-text-main">{selectedConsignment.owner?.fullName}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-text-subtle">Estado:</span>
                {getStatusBadge(selectedConsignment.status)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleDeleteConsignment}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-100"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PermissionGuard>
  );
}
