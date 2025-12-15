/**
 * Permissions Helpers
 * Utilidades para verificar permisos según roles
 */

import {
  UserRole,
  PERMISSIONS,
  ROLE_HIERARCHY,
  WRITE_ROLES,
  READ_ONLY_ROLES,
  TEAM_MANAGER_ROLES,
  type ModulePermissions,
} from '@/types/roles';
import type { User } from '@/types/auth';

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Verifica si un usuario tiene alguno de los roles especificados
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
}

/**
 * Verifica si un usuario tiene mayor o igual jerarquía que un rol requerido
 */
export function hasHigherOrEqualRole(
  user: User | null,
  requiredRole: UserRole
): boolean {
  if (!user) return false;

  const userIndex = ROLE_HIERARCHY.indexOf(user.role as UserRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);

  // Si no se encuentra el rol, denegar acceso
  if (userIndex === -1) return false;

  // Menor índice = mayor privilegio
  return userIndex <= requiredIndex;
}

/**
 * Verifica si el usuario puede escribir (no es de solo lectura)
 */
export function canWrite(user: User | null): boolean {
  if (!user) return false;
  return WRITE_ROLES.includes(user.role as UserRole);
}

/**
 * Verifica si el usuario es de solo lectura
 */
export function isReadOnly(user: User | null): boolean {
  if (!user) return true;
  return READ_ONLY_ROLES.includes(user.role as UserRole);
}

/**
 * Verifica si el usuario puede gestionar equipos
 */
export function canManageTeam(user: User | null): boolean {
  if (!user) return false;
  return TEAM_MANAGER_ROLES.includes(user.role as UserRole);
}

/**
 * Verifica si el usuario es SUPERADMIN
 */
export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, UserRole.SUPERADMIN);
}

/**
 * Verifica si el usuario es ADMIN (dueño del concesionario)
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, UserRole.ADMIN);
}

/**
 * Verifica si el usuario es SALES_LEADER
 */
export function isSalesLeader(user: User | null): boolean {
  return hasRole(user, UserRole.SALES_LEADER);
}

/**
 * Verifica si el usuario es SELLER
 */
export function isSeller(user: User | null): boolean {
  return hasRole(user, UserRole.SELLER);
}

/**
 * Verifica si el usuario es AUDITOR
 */
export function isAuditor(user: User | null): boolean {
  return hasRole(user, UserRole.AUDITOR);
}

/**
 * Obtiene los permisos del usuario para un módulo específico
 */
export function getModulePermissions(
  user: User | null,
  module: string
): ModulePermissions | null {
  if (!user) return null;

  const modulePermissions = PERMISSIONS[module];
  if (!modulePermissions) return null;

  return modulePermissions[user.role as UserRole] || null;
}

/**
 * Verifica si el usuario puede ver un módulo
 */
export function canViewModule(user: User | null, module: string): boolean {
  const permissions = getModulePermissions(user, module);
  return permissions?.canView ?? false;
}

/**
 * Verifica si el usuario puede crear en un módulo
 */
export function canCreateInModule(user: User | null, module: string): boolean {
  const permissions = getModulePermissions(user, module);
  return permissions?.canCreate ?? false;
}

/**
 * Verifica si el usuario puede editar en un módulo
 */
export function canEditInModule(user: User | null, module: string): boolean {
  const permissions = getModulePermissions(user, module);
  return permissions?.canEdit ?? false;
}

/**
 * Verifica si el usuario puede eliminar en un módulo
 */
export function canDeleteInModule(user: User | null, module: string): boolean {
  const permissions = getModulePermissions(user, module);
  return permissions?.canDelete ?? false;
}

/**
 * Verifica si el usuario puede asignar en un módulo (CRM)
 */
export function canAssignInModule(user: User | null, module: string): boolean {
  const permissions = getModulePermissions(user, module);
  return permissions?.canAssign ?? false;
}

/**
 * Verifica si el usuario puede aprobar en un módulo (Ventas)
 */
export function canApproveInModule(user: User | null, module: string): boolean {
  const permissions = getModulePermissions(user, module);
  return permissions?.canApprove ?? false;
}

/**
 * Verifica si un recurso pertenece al usuario
 * (para SELLER que solo puede ver sus propios recursos)
 */
export function isResourceOwner(
  user: User | null,
  resourceOwnerId: string | null | undefined
): boolean {
  if (!user || !resourceOwnerId) return false;
  return user.id === resourceOwnerId;
}

/**
 * Verifica si el usuario puede acceder a un recurso según su rol
 * - ADMIN: Acceso total al tenant
 * - SALES_LEADER: Solo si es suyo o de su equipo (requiere verificación adicional)
 * - SELLER: Solo si es suyo
 * - AUDITOR: Solo lectura (verificado en otros lugares)
 * - SUPERADMIN: NO tiene acceso a recursos de negocio
 */
export function canAccessResource(
  user: User | null,
  resourceOwnerId: string | null | undefined,
  subordinateIds?: string[]
): boolean {
  if (!user) return false;

  // SUPERADMIN no tiene acceso a recursos de negocio
  if (isSuperAdmin(user)) {
    return false;
  }

  // ADMIN tiene acceso total al tenant
  if (isAdmin(user)) {
    return true;
  }

  // AUDITOR tiene acceso de lectura (verificado en otros lugares)
  if (isAuditor(user)) {
    return true;
  }

  // Sin propietario: permitir acceso (recursos sin asignar)
  if (!resourceOwnerId) {
    return isSalesLeader(user); // Solo líderes pueden ver sin asignar
  }

  // SELLER: Solo recursos propios
  if (isSeller(user)) {
    return isResourceOwner(user, resourceOwnerId);
  }

  // SALES_LEADER: Recursos propios + de subordinados
  if (isSalesLeader(user)) {
    // Si es propio
    if (isResourceOwner(user, resourceOwnerId)) {
      return true;
    }

    // Si es de un subordinado (requiere pasar subordinateIds)
    if (subordinateIds && subordinateIds.includes(resourceOwnerId)) {
      return true;
    }
  }

  return false;
}

/**
 * Filtra una lista de items según ownership
 * (útil para filtrar en el cliente)
 */
export function filterByOwnership<T extends { assignedTo?: string | null }>(
  user: User | null,
  items: T[],
  subordinateIds?: string[]
): T[] {
  if (!user) return [];

  // SUPERADMIN no tiene acceso a recursos de negocio
  if (isSuperAdmin(user)) {
    return [];
  }

  // ADMIN y AUDITOR ven todo del tenant
  if (isAdmin(user) || isAuditor(user)) {
    return items;
  }

  // SALES_LEADER: Propios + de subordinados + sin asignar
  if (isSalesLeader(user)) {
    return items.filter((item) => {
      const ownerId = item.assignedTo;

      // Sin asignar
      if (!ownerId) return true;

      // Propio
      if (ownerId === user.id) return true;

      // De subordinado
      if (subordinateIds && subordinateIds.includes(ownerId)) return true;

      return false;
    });
  }

  // SELLER: Solo propios
  if (isSeller(user)) {
    return items.filter(
      (item) => item.assignedTo === user.id || !item.assignedTo
    );
  }

  return [];
}

/**
 * Obtiene mensaje de restricción de permisos según el rol
 */
export function getPermissionDeniedMessage(user: User | null): string {
  if (!user) {
    return 'Debes iniciar sesión para acceder a este recurso.';
  }

  if (isAuditor(user)) {
    return 'Los auditores tienen acceso de solo lectura.';
  }

  if (isSeller(user)) {
    return 'Solo puedes acceder a tus propios recursos.';
  }

  if (isSalesLeader(user)) {
    return 'Solo puedes acceder a recursos de tu equipo.';
  }

  return 'No tienes permisos para realizar esta acción.';
}

/**
 * Verifica si el usuario puede ver el menú de administración
 */
export function canAccessAdminMenu(user: User | null): boolean {
  return hasAnyRole(user, [UserRole.SUPERADMIN, UserRole.ADMIN]);
}

/**
 * Verifica si el usuario puede ver configuraciones
 */
export function canAccessSettings(user: User | null): boolean {
  return hasAnyRole(user, [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.SALES_LEADER,
  ]);
}

/**
 * Verifica si el usuario puede ver reportes/analytics
 */
export function canAccessReports(user: User | null): boolean {
  return hasAnyRole(user, [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.SALES_LEADER,
    UserRole.AUDITOR,
  ]);
}
