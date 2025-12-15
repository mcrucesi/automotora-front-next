"use client";

import { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/ui';
import { apiClient } from '@/lib/api/client';
import { User } from 'lucide-react';
import type { ApiResponse } from '@/types/auth';

interface Seller {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AssignSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  currentSellerId?: string | null;
  onSuccess: () => void;
}

export function AssignSellerModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  currentSellerId,
  onSuccess,
}: AssignSellerModalProps) {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSellers();
      setSelectedSellerId(currentSellerId || '');
    }
  }, [isOpen, currentSellerId]);

  const fetchSellers = async () => {
    try {
      setIsLoadingSellers(true);
      setError(null);

      // Obtener usuarios con rol seller o admin
      const response = await apiClient.get<ApiResponse<{ data: Seller[] }>>('/auth/users', {
        params: { limit: '100' }
      });

      // Filtrar solo sellers y admins
      const sellerUsers = response.data.data.filter(
        (user: Seller) => user.role === 'seller' || user.role === 'admin'
      );

      setSellers(sellerUsers);
    } catch (err) {
      console.error('Error fetching sellers:', err);
      setError('Error al cargar la lista de vendedores');
    } finally {
      setIsLoadingSellers(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedSellerId) {
      setError('Por favor selecciona un vendedor');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await apiClient.patch(`/customers/${customerId}/assign/${selectedSellerId}`);

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error assigning customer:', err);
      setError(err instanceof Error ? err.message : 'Error al asignar el lead');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSelectedSellerId('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Asignar Lead a Vendedor"
      size="md"
    >
      <div className="space-y-4">
        {/* Customer Info */}
        <div className="bg-surface-main p-4 rounded-lg">
          <p className="text-sm text-text-subtle mb-1">Lead:</p>
          <p className="font-semibold text-text-main">{customerName}</p>
        </div>

        {/* Seller Selection */}
        <div>
          <label htmlFor="seller" className="block text-sm font-medium text-text-main mb-2">
            Seleccionar Vendedor *
          </label>

          {isLoadingSellers ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-subtle">Cargando vendedores...</p>
            </div>
          ) : sellers.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                No hay vendedores disponibles. Contacta al administrador.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {sellers.map((seller) => (
                <label
                  key={seller.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSellerId === seller.id
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-white border-2 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="seller"
                    value={seller.id}
                    checked={selectedSellerId === seller.id}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500"
                  />
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-main">{seller.fullName}</p>
                    <p className="text-xs text-text-subtle">
                      {seller.email}
                      {seller.id === currentSellerId && (
                        <span className="ml-2 text-primary-600 font-medium">
                          (Actual)
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    seller.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {seller.role === 'admin' ? 'Admin' : 'Vendedor'}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={isLoading || !selectedSellerId || sellers.length === 0}
          >
            {isLoading ? 'Asignando...' : 'Asignar Lead'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
