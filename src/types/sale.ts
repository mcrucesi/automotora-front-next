export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  FINANCING = 'financing',
  MIXED = 'mixed',
}

export enum SaleStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAYMENT_PENDING = 'payment_pending',
  PAID = 'paid',
  FINANCING_APPROVED = 'financing_approved',
  FINANCING_REJECTED = 'financing_rejected',
  READY_FOR_DELIVERY = 'ready_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Sale {
  id: string;
  saleNumber: string;
  vehicleId: string;
  customerId: string;
  sellerId: string;
  salePrice: number;
  discount?: number;
  commissionRate: number;
  paymentMethod: PaymentMethod;
  downPayment?: number;
  financingMonths?: number;
  monthlyPayment?: number;
  status: SaleStatus;
  notes?: string;
  saleDate: string;
  deliveryDate?: string;
  consignmentId?: string;
  createdAt: string;
  updatedAt: string;

  // Populated fields
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    vin: string;
  };
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  seller?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CreateSaleDto {
  vehicleId: string;
  customerId: string;
  salePrice: number;
  discount?: number;
  commissionRate?: number;
  paymentMethod: PaymentMethod;
  downPayment?: number;
  financingMonths?: number;
  monthlyPayment?: number;
  notes?: string;
  soldAt?: string;
  deliveryDate?: string;
}

export interface UpdateSaleDto {
  salePrice?: number;
  discount?: number;
  commissionRate?: number;
  status?: SaleStatus;
  notes?: string;
  deliveryDate?: string;
}

export interface SalesListResponse {
  data: Sale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SaleFilters {
  status?: SaleStatus;
  sellerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  averageSalePrice: number;
}
