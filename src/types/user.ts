import { UserRole } from './roles';

/**
 * User Entity - Matches backend User model
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string | null;
  locationId: string | null;
  managerId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations (when populated)
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  location?: {
    id: string;
    name: string;
    code: string;
  };
  manager?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Create User DTO - Para registro de nuevos usuarios
 */
export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  tenantId?: string; // Opcional para SUPERADMIN
  locationId?: string; // Opcional para ADMIN y SALES_LEADER
  managerId?: string; // Opcional - Para SELLER (asignar a SALES_LEADER)
}

/**
 * Update User DTO - Para actualización de usuarios
 */
export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  role?: UserRole;
  locationId?: string;
  managerId?: string;
  isActive?: boolean;
}

/**
 * User Filter DTO - Para filtrado y búsqueda
 */
export interface FilterUsersDto {
  role?: UserRole;
  tenantId?: string;
  locationId?: string;
  managerId?: string;
  isActive?: boolean;
  search?: string; // Búsqueda por nombre o email
}

/**
 * User Response - Respuesta de la API (sin password)
 */
export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string | null;
  locationId: string | null;
  managerId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  location?: {
    id: string;
    name: string;
    code: string;
  };
  manager?: {
    id: string;
    fullName: string;
    email: string;
  };
}

/**
 * User Statistics
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: Record<UserRole, number>;
  byLocation: Array<{
    locationId: string;
    locationName: string;
    count: number;
  }>;
}

/**
 * Manager Option - Para selects de managers
 */
export interface ManagerOption {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  locationId: string | null;
}

/**
 * User Form State
 */
export interface UserFormState {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: UserRole;
  tenantId: string;
  locationId: string;
  managerId: string;
}

/**
 * User Table Column
 */
export interface UserTableColumn {
  fullName: string;
  email: string;
  role: UserRole;
  location: string;
  manager: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
