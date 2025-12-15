/**
 * PermissionGuard Component
 * Wrapper component para proteger contenido según permisos
 */

'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/roles';
import {
  hasRole,
  hasAnyRole,
  canViewModule,
  canCreateInModule,
  canEditInModule,
  canDeleteInModule,
  getPermissionDeniedMessage,
} from '@/lib/permissions';
import { AlertCircle } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;

  /** Requiere un rol específico */
  requireRole?: UserRole;

  /** Requiere alguno de estos roles */
  requireAnyRole?: UserRole[];

  /** Requiere permiso de ver módulo */
  requireViewModule?: string;

  /** Requiere permiso de crear en módulo */
  requireCreateModule?: string;

  /** Requiere permiso de editar en módulo */
  requireEditModule?: string;

  /** Requiere permiso de eliminar en módulo */
  requireDeleteModule?: string;

  /** Componente a mostrar si no tiene permisos (default: null) */
  fallback?: ReactNode;

  /** Mostrar mensaje de error si no tiene permisos */
  showError?: boolean;
}

export function PermissionGuard({
  children,
  requireRole,
  requireAnyRole,
  requireViewModule,
  requireCreateModule,
  requireEditModule,
  requireDeleteModule,
  fallback = null,
  showError = false,
}: PermissionGuardProps) {
  const { user } = useAuth();

  // Verificar permisos
  let hasPermission = true;

  if (requireRole) {
    hasPermission = hasPermission && hasRole(user, requireRole);
  }

  if (requireAnyRole) {
    hasPermission = hasPermission && hasAnyRole(user, requireAnyRole);
  }

  if (requireViewModule) {
    hasPermission = hasPermission && canViewModule(user, requireViewModule);
  }

  if (requireCreateModule) {
    hasPermission = hasPermission && canCreateInModule(user, requireCreateModule);
  }

  if (requireEditModule) {
    hasPermission = hasPermission && canEditInModule(user, requireEditModule);
  }

  if (requireDeleteModule) {
    hasPermission = hasPermission && canDeleteInModule(user, requireDeleteModule);
  }

  // Si tiene permisos, mostrar contenido
  if (hasPermission) {
    return <>{children}</>;
  }

  // Si no tiene permisos y se solicita mostrar error
  if (showError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">
              Acceso denegado
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {getPermissionDeniedMessage(user)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si no tiene permisos, mostrar fallback o null
  return <>{fallback}</>;
}

/**
 * Hook helper para verificar permisos de forma condicional
 */
export function usePermission() {
  const { user } = useAuth();

  return {
    hasRole: (role: UserRole) => hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
    canViewModule: (module: string) => canViewModule(user, module),
    canCreateInModule: (module: string) => canCreateInModule(user, module),
    canEditInModule: (module: string) => canEditInModule(user, module),
    canDeleteInModule: (module: string) => canDeleteInModule(user, module),
  };
}
