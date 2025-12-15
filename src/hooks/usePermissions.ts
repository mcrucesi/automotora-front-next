import { useAuth } from '@/contexts/AuthContext';
import {
  canViewModule,
  canCreateInModule,
  canEditInModule,
  canDeleteInModule,
  canAssignInModule,
  canApproveInModule,
  canAccessResource,
  getModulePermissions,
  type ModulePermissions,
} from '@/lib/permissions';

/**
 * Hook para verificar permisos del usuario actual
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene un permiso específico en un módulo
   */
  const hasPermission = (
    module: string,
    action: keyof ModulePermissions
  ): boolean => {
    const permissions = getModulePermissions(user, module);
    if (!permissions) return false;

    return permissions[action] ?? false;
  };

  /**
   * Verifica si el usuario puede ver un módulo
   */
  const canView = (module: string): boolean => {
    return canViewModule(user, module);
  };

  /**
   * Verifica si el usuario puede crear en un módulo
   */
  const canCreate = (module: string): boolean => {
    return canCreateInModule(user, module);
  };

  /**
   * Verifica si el usuario puede editar en un módulo
   */
  const canEdit = (module: string): boolean => {
    return canEditInModule(user, module);
  };

  /**
   * Verifica si el usuario puede eliminar en un módulo
   */
  const canDelete = (module: string): boolean => {
    return canDeleteInModule(user, module);
  };

  /**
   * Verifica si el usuario puede asignar en un módulo
   */
  const canAssign = (module: string): boolean => {
    return canAssignInModule(user, module);
  };

  /**
   * Verifica si el usuario puede aprobar en un módulo
   */
  const canApprove = (module: string): boolean => {
    return canApproveInModule(user, module);
  };

  /**
   * Verifica si el usuario puede acceder a un recurso específico
   * (considerando ownership)
   */
  const canAccessResourceItem = (
    resourceOwnerId: string | null | undefined,
    subordinateIds?: string[]
  ): boolean => {
    return canAccessResource(user, resourceOwnerId, subordinateIds);
  };

  /**
   * Verifica si el usuario puede editar un recurso específico
   * (combina permiso de módulo + ownership)
   */
  const canEditResource = (
    module: string,
    resourceOwnerId: string | null | undefined,
    subordinateIds?: string[]
  ): boolean => {
    // Primero verificar permiso general del módulo
    if (!canEditInModule(user, module)) {
      return false;
    }

    // Luego verificar ownership
    return canAccessResource(user, resourceOwnerId, subordinateIds);
  };

  /**
   * Verifica si el usuario puede eliminar un recurso específico
   * (combina permiso de módulo + ownership)
   */
  const canDeleteResource = (
    module: string,
    resourceOwnerId: string | null | undefined,
    subordinateIds?: string[]
  ): boolean => {
    // Primero verificar permiso general del módulo
    if (!canDeleteInModule(user, module)) {
      return false;
    }

    // Luego verificar ownership
    return canAccessResource(user, resourceOwnerId, subordinateIds);
  };

  return {
    user,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canAssign,
    canApprove,
    canAccessResourceItem,
    canEditResource,
    canDeleteResource,
  };
}
