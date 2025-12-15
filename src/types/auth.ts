/**
 * Authentication Types
 * Basado en la estructura del backend NestJS
 */

import { UserRole } from './roles';

// Wrapper de respuesta del backend (TransformInterceptor)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * User Interface - Sincronizado con backend
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole | string; // String para compatibilidad con roles antiguos
  isActive: boolean;
  tenantId: string;

  // Nuevos campos
  locationId?: string;
  managerId?: string;
  phone?: string;

  // Relaciones (populated fields)
  location?: {
    id: string;
    name: string;
    code?: string;
  };
  manager?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
