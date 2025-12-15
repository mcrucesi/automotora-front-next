/**
 * Tenant Types
 */

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  isActive: boolean;
  plan: string;
  maxUsers: number;
  maxLocations: number;
  features?: any | null;
  billingEmail?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    locations: number;
    vehicles: number;
    customers: number;
    sales: number;
  };
}

export interface TenantStats {
  totalUsers: number;
  totalLocations: number;
  totalVehicles: number;
  totalCustomers: number;
  totalSales: number;
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalLocations: number;
}
