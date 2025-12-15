/**
 * Location Types
 * Interfaces para la gestión de sucursales/locaciones
 */

export interface Location {
  id: string;
  tenantId: string;
  name: string;
  code: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  managerName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  managerName?: string;
}

export interface UpdateLocationDto extends Partial<CreateLocationDto> {}

export interface LocationFilters {
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'city' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LocationsListResponse {
  data: Location[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
