"use client";

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { RoleBadge } from './RoleBadge';
import type { User } from '@/types/user';
import { apiClient } from '@/lib/api/client';

interface DeleteUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteUserModal = ({
  user,
  isOpen,
  onClose,
  onSuccess,
}: DeleteUserModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    setError(null);

    try {
      await apiClient.delete(`/auth/users/${user.id}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        'Error al eliminar el usuario';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar Usuario" size="md">
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
            ¿Estás seguro de eliminar este usuario?
          </p>
          <p className="text-sm text-text-subtle">
            Esta acción no se puede deshacer. Todos los datos asociados a este usuario
            permanecerán en el sistema, pero el usuario ya no podrá acceder.
          </p>
        </div>

        {/* User Details */}
        <div className="bg-surface-secondary rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-text-subtle">Nombre:</span>
            <span className="text-sm text-text-main font-semibold">{user.fullName}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-text-subtle">Email:</span>
            <span className="text-sm text-text-main">{user.email}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-text-subtle">Rol:</span>
            <RoleBadge role={user.role} />
          </div>
          {user.location && (
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-text-subtle">Sucursal:</span>
              <span className="text-sm text-text-main">
                {user.location.name} ({user.location.code})
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-100"
          >
            {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
