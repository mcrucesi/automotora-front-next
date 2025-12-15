"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { SaleForm } from '@/components/sales';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import type { Sale, SalesListResponse, SaleStatus, PaymentMethod } from '@/types/sale';
import type { ApiResponse } from '@/types/auth';
import { Plus, Eye, Edit, Calendar, DollarSign, CreditCard, User, Car, FileText } from 'lucide-react';

export default function SalesPage() {
  const { canEdit } = usePermissions();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<ApiResponse<SalesListResponse>>('/sales');
      setSales(response.data.data);
    } catch (err) {
      setError('Error al cargar las ventas');
      console.error('Error fetching sales:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: SaleStatus) => {
    const statusMap: Record<SaleStatus, { variant: any; label: string }> = {
      pending: { variant: 'warning', label: 'Pendiente' },
      confirmed: { variant: 'primary', label: 'Confirmada' },
      payment_pending: { variant: 'warning', label: 'Pago Pendiente' },
      paid: { variant: 'success', label: 'Pagada' },
      financing_approved: { variant: 'success', label: 'Financiamiento Aprobado' },
      financing_rejected: { variant: 'error', label: 'Financiamiento Rechazado' },
      ready_for_delivery: { variant: 'primary', label: 'Lista para Entrega' },
      delivered: { variant: 'success', label: 'Entregada' },
      cancelled: { variant: 'error', label: 'Cancelada' },
    };

    const config = statusMap[status] || { variant: 'gray', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const methodMap: Record<PaymentMethod, string> = {
      cash: 'Efectivo',
      credit_card: 'Tarjeta de Crédito',
      debit_card: 'Tarjeta de Débito',
      bank_transfer: 'Transferencia',
      financing: 'Financiamiento',
      mixed: 'Mixto',
    };
    return methodMap[method] || method;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleOpenDetailsModal = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSale(null);
  };

  const calculateCommission = (salePrice: number, commissionRate: number) => {
    return salePrice * (commissionRate / 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-subtle">Cargando ventas...</p>
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
    <PermissionGuard module="sales" action="canView">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main mb-2">
            Ventas
          </h1>
          <p className="text-text-subtle">
            Gestiona las ventas realizadas ({sales.length} ventas)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </Button>
      </div>

      <Card>
        {sales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-subtle mb-4">No hay ventas registradas</p>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Registrar primera venta
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    # Venta
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Vehículo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Precio
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-main">
                    Método
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
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border-subtle hover:bg-surface-hover transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-mono text-sm font-medium text-text-main">
                        {sale.saleNumber}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {sale.customer ? (
                        <div>
                          <p className="font-medium text-text-main">
                            {sale.customer.firstName} {sale.customer.lastName}
                          </p>
                          <p className="text-sm text-text-subtle">
                            {sale.customer.email || sale.customer.phone}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-text-subtle">Sin datos</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {sale.vehicle ? (
                        <div>
                          <p className="font-medium text-text-main">
                            {sale.vehicle.brand} {sale.vehicle.model}
                          </p>
                          <p className="text-sm text-text-subtle">
                            {sale.vehicle.year}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-text-subtle">Sin datos</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-main">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-text-main">
                          {formatCurrency(sale.salePrice)}
                        </p>
                        {sale.discount && sale.discount > 0 && (
                          <p className="text-xs text-success-main">
                            -{formatCurrency(sale.discount)} desc.
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-main">
                      {getPaymentMethodLabel(sale.paymentMethod)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 hover:bg-surface-hover rounded-md transition-colors"
                          title="Ver detalles"
                          onClick={() => handleOpenDetailsModal(sale)}
                        >
                          <Eye className="w-4 h-4 text-text-subtle" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Detalles */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        title={`Venta ${selectedSale?.saleNumber}`}
        size="lg"
      >
        {selectedSale && (
          <div className="space-y-6">
            {/* Estado y Fecha */}
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                {getStatusBadge(selectedSale.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-subtle">
                <Calendar className="w-4 h-4" />
                {formatDate(selectedSale.saleDate)}
              </div>
            </div>

            {/* Cliente */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Cliente</h3>
              </div>
              {selectedSale.customer ? (
                <div className="bg-surface-main p-4 rounded-lg">
                  <p className="font-medium text-text-main">
                    {selectedSale.customer.firstName} {selectedSale.customer.lastName}
                  </p>
                  {selectedSale.customer.email && (
                    <p className="text-sm text-text-subtle mt-1">{selectedSale.customer.email}</p>
                  )}
                  {selectedSale.customer.phone && (
                    <p className="text-sm text-text-subtle">{selectedSale.customer.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-text-subtle">Sin información del cliente</p>
              )}
            </div>

            {/* Vehículo */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Vehículo</h3>
              </div>
              {selectedSale.vehicle ? (
                <div className="bg-surface-main p-4 rounded-lg">
                  <p className="font-medium text-text-main">
                    {selectedSale.vehicle.brand} {selectedSale.vehicle.model} {selectedSale.vehicle.year}
                  </p>
                  <p className="text-sm text-text-subtle mt-1 font-mono">{selectedSale.vehicle.vin}</p>
                </div>
              ) : (
                <p className="text-sm text-text-subtle">Sin información del vehículo</p>
              )}
            </div>

            {/* Información Financiera */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Información Financiera</h3>
              </div>
              <div className="bg-surface-main p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-subtle">Precio de Venta:</span>
                  <span className="font-semibold text-text-main">
                    {formatCurrency(selectedSale.salePrice)}
                  </span>
                </div>
                {selectedSale.discount && selectedSale.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-subtle">Descuento:</span>
                    <span className="font-semibold text-success-main">
                      -{formatCurrency(selectedSale.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border-subtle">
                  <span className="text-sm text-text-subtle">Total Final:</span>
                  <span className="font-bold text-lg text-text-main">
                    {formatCurrency(selectedSale.salePrice - (selectedSale.discount || 0))}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border-subtle">
                  <span className="text-sm text-text-subtle">Comisión ({selectedSale.commissionRate}%):</span>
                  <span className="font-semibold text-accent-main">
                    {formatCurrency(calculateCommission(selectedSale.salePrice, selectedSale.commissionRate))}
                  </span>
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-primary-main" />
                <h3 className="font-semibold text-text-main">Método de Pago</h3>
              </div>
              <div className="bg-surface-main p-4 rounded-lg">
                <p className="font-medium text-text-main">
                  {getPaymentMethodLabel(selectedSale.paymentMethod)}
                </p>
                {selectedSale.paymentMethod === 'financing' && (
                  <div className="mt-3 space-y-1">
                    {selectedSale.downPayment && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-subtle">Inicial:</span>
                        <span className="text-text-main">{formatCurrency(selectedSale.downPayment)}</span>
                      </div>
                    )}
                    {selectedSale.financingMonths && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-subtle">Plazo:</span>
                        <span className="text-text-main">{selectedSale.financingMonths} meses</span>
                      </div>
                    )}
                    {selectedSale.monthlyPayment && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-subtle">Cuota Mensual:</span>
                        <span className="text-text-main">{formatCurrency(selectedSale.monthlyPayment)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            {selectedSale.notes && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-primary-main" />
                  <h3 className="font-semibold text-text-main">Notas</h3>
                </div>
                <div className="bg-surface-main p-4 rounded-lg">
                  <p className="text-sm text-text-main whitespace-pre-wrap">{selectedSale.notes}</p>
                </div>
              </div>
            )}

            {/* Vendedor */}
            {selectedSale.seller && (
              <div className="pt-4 border-t border-border-subtle">
                <p className="text-sm text-text-subtle">
                  Vendedor: <span className="font-medium text-text-main">{selectedSale.seller.fullName}</span>
                </p>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button variant="outline" onClick={handleCloseDetailsModal}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Crear Venta */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nueva Venta"
        size="xl"
      >
        <SaleForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchSales();
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </PermissionGuard>
  );
}
