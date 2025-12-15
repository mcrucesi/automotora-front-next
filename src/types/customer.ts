/**
 * Customer/Lead Types
 * Based on NestJS backend structure
 */

// Enums
export type CustomerStage =
  | 'new'           // Nuevo lead
  | 'contacted'     // Contactado
  | 'qualified'     // Calificado
  | 'negotiating'   // En negociación
  | 'closed_won'    // Ganado (venta cerrada)
  | 'closed_lost';  // Perdido

export type CustomerSource =
  | 'web'           // Sitio web
  | 'phone'         // Llamada telefónica
  | 'email'         // Email
  | 'referral'      // Referido
  | 'walk_in'       // Visita presencial
  | 'social_media'  // Redes sociales
  | 'advertisement' // Publicidad
  | 'other';        // Otro

export type CustomerType =
  | 'buyer'      // Comprador
  | 'consigner'  // Consignador
  | 'both';      // Ambos

export type InteractionType =
  | 'call'        // Llamada
  | 'email'       // Email
  | 'meeting'     // Reunión
  | 'whatsapp'    // WhatsApp
  | 'test_drive'  // Prueba de manejo
  | 'other';      // Otro

// Entities
export interface Customer {
  id: string;
  tenantId: string;
  type: CustomerType;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  secondaryPhone: string | null;
  source: CustomerSource;
  stage: CustomerStage;
  interestedIn: string | null;  // Vehicle ID
  budgetMin: number | null;
  budgetMax: number | null;
  assignedTo: string | null;    // User ID
  notes: string | null;
  tags: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  lastContactAt: string | null;
}

export interface Interaction {
  id: string;
  customerId: string;
  userId: string;
  type: InteractionType;
  subject: string | null;
  notes: string;
  scheduledAt: string | null;
  completedAt: string | null;
  outcome: string | null;
  nextAction: string | null;
  createdAt: string;
}

// DTOs
export interface CreateCustomerDto {
  type?: CustomerType;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  secondaryPhone?: string;
  source: CustomerSource;
  interestedIn?: string;
  budgetMin?: number;
  budgetMax?: number;
  assignedTo?: string;
  notes?: string;
  tags?: Record<string, any>;
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  stage?: CustomerStage;
  interestedIn?: string;
  budgetMin?: number;
  budgetMax?: number;
  assignedTo?: string;
  notes?: string;
  tags?: Record<string, any>;
}

export interface CreateInteractionDto {
  type: InteractionType;
  subject?: string;
  notes: string;
  scheduledAt?: string;
  outcome?: string;
  nextAction?: string;
}

export interface CustomerFilters {
  stage?: CustomerStage;
  source?: CustomerSource;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
