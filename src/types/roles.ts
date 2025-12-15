/**
 * User Roles and Permissions
 * Debe coincidir exactamente con el enum del backend (Prisma)
 */

/**
 * User Role Enum - Sincronizado con backend
 */
export enum UserRole {
  /**
   * Proveedor SaaS - Gestión de plataforma únicamente
   * PUEDE: Crear tenants, gestionar locations, registrar admins, ver reportes por tenant
   * NO PUEDE: Acceder a clientes, leads, ventas, vehículos, consignaciones
   */
  SUPERADMIN = 'SUPERADMIN',

  /** Dueño/Gerente General del concesionario - Control total del tenant */
  ADMIN = 'ADMIN',

  /** Jefe de Sucursal/Equipo - Supervisa vendedores */
  SALES_LEADER = 'SALES_LEADER',

  /** Vendedor individual - Solo sus asignaciones */
  SELLER = 'SELLER',

  /** Auditor - Solo lectura en todo el tenant */
  AUDITOR = 'AUDITOR',
}

/**
 * Labels en español para cada rol
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: 'Super Administrador',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.SALES_LEADER]: 'Líder de Ventas',
  [UserRole.SELLER]: 'Vendedor',
  [UserRole.AUDITOR]: 'Auditor',
};

/**
 * Descripciones para cada rol
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: 'Gestión de plataforma SaaS - Tenants, locations y usuarios admin',
  [UserRole.ADMIN]: 'Control completo del concesionario',
  [UserRole.SALES_LEADER]: 'Gestiona equipo de vendedores en su sucursal',
  [UserRole.SELLER]: 'Gestiona sus propias ventas y clientes',
  [UserRole.AUDITOR]: 'Visualización de reportes y métricas',
};

/**
 * Colores para badges de roles (Tailwind classes)
 */
export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  [UserRole.SUPERADMIN]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
  },
  [UserRole.ADMIN]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
  [UserRole.SALES_LEADER]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  [UserRole.SELLER]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
  },
  [UserRole.AUDITOR]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
  },
};

/**
 * Iconos para cada rol (lucide-react)
 */
export const ROLE_ICONS: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: 'Shield',
  [UserRole.ADMIN]: 'Crown',
  [UserRole.SALES_LEADER]: 'Users',
  [UserRole.SELLER]: 'User',
  [UserRole.AUDITOR]: 'Eye',
};

/**
 * Jerarquía de roles (mayor a menor privilegio)
 */
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.ADMIN,
  UserRole.SALES_LEADER,
  UserRole.SELLER,
  UserRole.AUDITOR,
];

/**
 * Roles con permisos de escritura (en módulos de negocio)
 * NOTA: SUPERADMIN no incluido porque no gestiona negocio, solo plataforma
 */
export const WRITE_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SALES_LEADER,
  UserRole.SELLER,
];

/**
 * Roles con acceso solo lectura
 */
export const READ_ONLY_ROLES: UserRole[] = [UserRole.AUDITOR];

/**
 * Roles que pueden gestionar equipos de ventas
 * NOTA: SUPERADMIN no gestiona equipos de ventas, solo gestiona usuarios admin
 */
export const TEAM_MANAGER_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SALES_LEADER,
];

/**
 * Permisos por módulo
 */
export interface ModulePermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign?: boolean;
  canApprove?: boolean;
}

/**
 * Matriz de permisos por módulo y rol
 */
export type PermissionsMatrix = Record<
  string, // Module name
  Record<UserRole, ModulePermissions>
>;

/**
 * Permisos definidos para cada módulo
 * NOTA: SUPERADMIN no tiene permisos en módulos de negocio (customers, vehicles, sales, consignments)
 * SUPERADMIN solo gestiona plataforma (tenants, locations, users)
 */
export const PERMISSIONS: PermissionsMatrix = {
  // CRM / Customers
  customers: {
    [UserRole.SUPERADMIN]: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canAssign: false,
    },
    [UserRole.ADMIN]: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canAssign: true,
    },
    [UserRole.SALES_LEADER]: {
      canView: true, // Solo su equipo
      canCreate: true,
      canEdit: true, // Solo su equipo
      canDelete: false,
      canAssign: true, // Solo a su equipo
    },
    [UserRole.SELLER]: {
      canView: true, // Solo propios
      canCreate: true,
      canEdit: true, // Solo propios
      canDelete: false,
      canAssign: false,
    },
    [UserRole.AUDITOR]: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canAssign: false,
    },
  },

  // Vehicles / Inventory
  vehicles: {
    [UserRole.SUPERADMIN]: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.ADMIN]: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    [UserRole.SALES_LEADER]: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    [UserRole.SELLER]: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.AUDITOR]: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },

  // Sales
  sales: {
    [UserRole.SUPERADMIN]: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
    },
    [UserRole.ADMIN]: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canApprove: true,
    },
    [UserRole.SALES_LEADER]: {
      canView: true, // Solo su equipo
      canCreate: true,
      canEdit: true, // Solo propias
      canDelete: false,
      canApprove: true,
    },
    [UserRole.SELLER]: {
      canView: true, // Solo propias
      canCreate: true,
      canEdit: true, // Solo propias
      canDelete: false,
      canApprove: false,
    },
    [UserRole.AUDITOR]: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
    },
  },

  // Consignments
  consignments: {
    [UserRole.SUPERADMIN]: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.ADMIN]: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    [UserRole.SALES_LEADER]: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    [UserRole.SELLER]: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.AUDITOR]: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },

  // Locations (SUPERADMIN puede gestionar locations como parte de la plataforma)
  locations: {
    [UserRole.SUPERADMIN]: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    [UserRole.ADMIN]: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    [UserRole.SALES_LEADER]: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.SELLER]: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.AUDITOR]: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },

  // Users Management (Gestión de usuarios del tenant)
  users: {
    [UserRole.SUPERADMIN]: {
      canView: true,
      canCreate: true, // Puede crear usuarios ADMIN
      canEdit: true,
      canDelete: true,
    },
    [UserRole.ADMIN]: {
      canView: true,
      canCreate: true, // Puede crear cualquier usuario del tenant
      canEdit: true,
      canDelete: true,
    },
    [UserRole.SALES_LEADER]: {
      canView: true, // Solo su equipo
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.SELLER]: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.AUDITOR]: {
      canView: true, // Solo lectura de usuarios
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },

  // Tenants (Solo SUPERADMIN - Gestión de plataforma)
  tenants: {
    [UserRole.SUPERADMIN]: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false, // Soft delete
    },
    [UserRole.ADMIN]: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.SALES_LEADER]: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.SELLER]: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    [UserRole.AUDITOR]: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
};
