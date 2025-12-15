"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { CustomerForm, InteractionForm, InteractionList, AssignSellerModal } from '@/components/crm';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import type { Customer, PaginatedCustomers, CustomerStage, CustomerSource } from '@/types/customer';
import type { ApiResponse } from '@/types/auth';
import { Plus, Edit, Eye, Phone, Mail, Search, DollarSign, User, MessageSquare, UserPlus } from 'lucide-react';

export default function CRMPage() {
  const { canEditResource, canAssign } = usePermissions();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<CustomerStage | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [interactionListKey, setInteractionListKey] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [page, selectedStage]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {
        page: page.toString(),
        limit: '10',
      };

      if (selectedStage) params.stage = selectedStage;
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.get<ApiResponse<PaginatedCustomers>>(
        '/customers',
        { params }
      );

      const data = response.data;
      setCustomers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const getStageConfig = (stage: CustomerStage) => {
    const stageMap: Record<CustomerStage, { label: string; color: string }> = {
      new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
      contacted: { label: 'Contactado', color: 'bg-orange-100 text-orange-800' },
      qualified: { label: 'Calificado', color: 'bg-yellow-100 text-yellow-800' },
      negotiating: { label: 'Negociando', color: 'bg-purple-100 text-purple-800' },
      closed_won: { label: 'Ganado', color: 'bg-green-100 text-green-800' },
      closed_lost: { label: 'Perdido', color: 'bg-gray-100 text-gray-800' },
    };

    return stageMap[stage];
  };

  const getSourceLabel = (source: CustomerSource) => {
    const sourceMap: Record<CustomerSource, string> = {
      web: 'Web',
      phone: 'Teléfono',
      email: 'Email',
      referral: 'Referido',
      walk_in: 'Visita',
      social_media: 'Redes Sociales',
      advertisement: 'Publicidad',
      other: 'Otro',
    };

    return sourceMap[source] || source;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenCreateModal = () => {
    setSelectedCustomer(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleOpenDetailsModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
    fetchCustomers();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-subtle">Cargando leads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <PermissionGuard module="customers" action="canView">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main">CRM</h1>
            <p className="text-text-subtle mt-1">
              Gestión de leads y clientes ({total} total)
            </p>
          </div>
          <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
            <Plus size={20} className="mr-2" />
            Nuevo Lead
          </Button>
        </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value as CustomerStage | '');
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las etapas</option>
              <option value="new">Nuevo</option>
              <option value="contacted">Contactado</option>
              <option value="qualified">Calificado</option>
              <option value="negotiating">Negociando</option>
              <option value="closed_won">Ganado</option>
              <option value="closed_lost">Perdido</option>
            </select>

            <Button type="submit" variant="primary">
              Buscar
            </Button>
          </div>
        </form>
      </Card>

      {/* Customer List */}
      <div className="grid grid-cols-1 gap-4">
        {customers.length === 0 ? (
          <Card>
            <p className="text-center text-text-subtle py-8">
              No se encontraron leads
            </p>
          </Card>
        ) : (
          customers.map((customer) => (
            <Card key={customer.id} hover>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Customer Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 font-bold text-lg">
                        {customer.firstName[0]}{customer.lastName[0]}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-text-main">
                          {customer.fullName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageConfig(customer.stage).color}`}>
                          {getStageConfig(customer.stage).label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-subtle">
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        <span>• {getSourceLabel(customer.source)}</span>
                        <span>• {formatDate(customer.createdAt)}</span>
                      </div>

                      {customer.budgetMin && customer.budgetMax && (
                        <div className="mt-2 text-sm text-text-subtle">
                          Presupuesto: ${customer.budgetMin.toLocaleString()} - ${customer.budgetMax.toLocaleString()}
                        </div>
                      )}

                      {customer.assignedTo && (
                        <div className="mt-2 flex items-center gap-1 text-xs">
                          <User size={12} className="text-primary-500" />
                          <span className="text-primary-600 font-medium">
                            Asignado a vendedor
                          </span>
                        </div>
                      )}
                      {!customer.assignedTo && customer.stage === 'new' && (
                        <div className="mt-2 flex items-center gap-1 text-xs">
                          <UserPlus size={12} className="text-orange-500" />
                          <span className="text-orange-600 font-medium">
                            Sin asignar
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDetailsModal(customer)}>
                    <Eye size={16} className="mr-1" />
                    Ver
                  </Button>

                  {canEditResource('customers', customer.assignedTo) && (
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(customer)}>
                      <Edit size={16} className="mr-1" />
                      Editar
                    </Button>
                  )}

                  {canAssign('customers') && (
                    <Button
                      variant={customer.assignedTo ? "ghost" : "primary"}
                      size="sm"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsAssignModalOpen(true);
                      }}
                    >
                      <UserPlus size={16} className="mr-1" />
                      {customer.assignedTo ? 'Reasignar' : 'Asignar'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="px-4 py-2 text-sm text-text-subtle">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modal Crear Cliente */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Lead"
        size="lg"
      >
        <CustomerForm
          onSuccess={handleFormSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Editar Cliente */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Cliente"
        size="lg"
      >
        <CustomerForm
          customer={selectedCustomer}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Modal Nueva Interacción */}
      <Modal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        title="Registrar Interacción"
        size="lg"
      >
        {selectedCustomer && (
          <InteractionForm
            customerId={selectedCustomer.id}
            onSuccess={() => {
              setIsInteractionModalOpen(false);
              // Refrescar la lista de interacciones
              setInteractionListKey(prev => prev + 1);
            }}
            onCancel={() => setIsInteractionModalOpen(false)}
          />
        )}
      </Modal>

      {/* Modal Detalles Cliente */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalles del Cliente"
        size="xl"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Header con Avatar */}
            <div className="flex items-center gap-4 pb-4 border-b border-border-subtle">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-bold text-2xl">
                  {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-main">{selectedCustomer.fullName}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStageConfig(selectedCustomer.stage).color}`}>
                  {getStageConfig(selectedCustomer.stage).label}
                </span>
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Contacto</h3>
              </div>
              <div className="bg-surface-main p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Teléfono Principal:</span>
                  <span className="text-sm font-medium text-text-main">{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.secondaryPhone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-subtle">Teléfono Secundario:</span>
                    <span className="text-sm font-medium text-text-main">{selectedCustomer.secondaryPhone}</span>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-subtle">Email:</span>
                    <span className="text-sm font-medium text-text-main">{selectedCustomer.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Información General */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Información General</h3>
              </div>
              <div className="bg-surface-main p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Tipo:</span>
                  <span className="text-sm font-medium text-text-main capitalize">{selectedCustomer.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Fuente:</span>
                  <span className="text-sm font-medium text-text-main">{getSourceLabel(selectedCustomer.source)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Fecha de Registro:</span>
                  <span className="text-sm font-medium text-text-main">{formatDate(selectedCustomer.createdAt)}</span>
                </div>
                {selectedCustomer.lastContactAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-subtle">Último Contacto:</span>
                    <span className="text-sm font-medium text-text-main">{formatDate(selectedCustomer.lastContactAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Presupuesto */}
            {(selectedCustomer.budgetMin || selectedCustomer.budgetMax) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-primary-main" />
                  <h3 className="font-semibold text-text-main">Presupuesto</h3>
                </div>
                <div className="bg-surface-main p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-subtle">Rango:</span>
                    <span className="text-lg font-semibold text-text-main">
                      {selectedCustomer.budgetMin ? formatCurrency(selectedCustomer.budgetMin) : '$0'} - {selectedCustomer.budgetMax ? formatCurrency(selectedCustomer.budgetMax) : '$0'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notas */}
            {selectedCustomer.notes && (
              <div>
                <h3 className="font-semibold text-text-main mb-2">Notas</h3>
                <div className="bg-surface-main p-4 rounded-lg">
                  <p className="text-sm text-text-main whitespace-pre-wrap">{selectedCustomer.notes}</p>
                </div>
              </div>
            )}

            {/* Interacciones */}
            <div className="border-t border-border-subtle pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-main" />
                  <h3 className="font-semibold text-text-main">Historial de Interacciones</h3>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsInteractionModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva Interacción
                </Button>
              </div>

              <InteractionList
                key={interactionListKey}
                customerId={selectedCustomer.id}
                refreshTrigger={interactionListKey}
              />
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                Cerrar
              </Button>
              <Button variant="primary" onClick={() => {
                setIsDetailsModalOpen(false);
                handleOpenEditModal(selectedCustomer);
              }}>
                <Edit size={16} className="mr-1" />
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Asignar a Vendedor */}
      {selectedCustomer && (
        <AssignSellerModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.fullName}
          currentSellerId={selectedCustomer.assignedTo}
          onSuccess={() => {
            setIsAssignModalOpen(false);
            fetchCustomers();
          }}
        />
      )}
      </div>
    </PermissionGuard>
  );
}
