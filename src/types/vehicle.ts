/**
 * Vehicle Types
 * Interfaces para la gestión de vehículos
 */

export interface Vehicle {
  id: string;
  tenantId: string;
  locationId: string | null;
  vin: string;
  brand: string;
  model: string;
  year: number;
  condition: string;
  status: 'available' | 'reserved' | 'sold';
  price: number;
  cost: number | null;
  currency: string;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  engineSize: string | null;
  doors: number | null;
  seats: number | null;
  description: string | null;
  features: Record<string, any> | null;
  isConsignment: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  availableFrom: string | null;
  reservedAt: string | null;
  soldAt: string | null;
}

export interface VehicleFilters {
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  status?: string;
  condition?: string;
  fuelType?: string;
  transmission?: string;
  page?: number;
  limit?: number;
}

export interface CreateVehicleDto {
  vin: string;
  brand: string;
  model: string;
  year: number;
  condition: string;
  price: number;
  cost?: number;
  currency?: string;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  engineSize?: string;
  doors?: number;
  seats?: number;
  description?: string;
  features?: Record<string, any>;
  isConsignment?: boolean;
  locationId?: string;
  availableFrom?: string;
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {}

export interface VehiclesListResponse {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Vehicle Image Types
 */
export interface VehicleImage {
  id: string;
  vehicleId: string;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface UploadImageResponse {
  message: string;
  images: VehicleImage[];
}

export interface VehicleImagesResponse {
  data: VehicleImage[];
}
