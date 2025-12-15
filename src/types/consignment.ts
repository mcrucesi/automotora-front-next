/**
 * Consignment Types
 * Interfaces para la gestión de consignaciones de vehículos
 */

import type { Vehicle } from './vehicle';
import type { Customer } from './customer';

export type ConsignmentStatus = 'active' | 'expired' | 'sold' | 'cancelled';
export type CommissionType = 'percentage' | 'fixed';

export interface Consignment {
  id: string;
  tenantId: string;
  vehicleId: string;
  ownerId: string;

  agreedPrice: number;
  minimumPrice: number | null;
  commissionType: CommissionType;
  commissionValue: number;

  agreementDate: string;
  startDate: string;
  expiryDate: string | null;

  status: ConsignmentStatus;
  notes: string | null;
  contractUrl: string | null;

  soldAt: string | null;
  finalSalePrice: number | null;
  commissionCharged: number | null;
  ownerPayment: number | null;

  createdAt: string;
  updatedAt: string;

  // Relations
  vehicle?: Vehicle;
  owner?: Customer;
}

export interface CreateConsignmentDto {
  vehicleId: string;
  ownerId: string;
  agreedPrice: number;
  minimumPrice?: number;
  commissionType?: CommissionType;
  commissionValue: number;
  startDate?: string;
  expiryDate?: string;
  notes?: string;
  contractUrl?: string;
}

export interface UpdateConsignmentDto extends Partial<CreateConsignmentDto> {
  status?: ConsignmentStatus;
  finalSalePrice?: number;
  commissionCharged?: number;
  ownerPayment?: number;
}

export interface ConsignmentsListResponse {
  data: Consignment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConsignmentFilters {
  status?: ConsignmentStatus;
  ownerId?: string;
  vehicleId?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  page?: number;
  limit?: number;
}
