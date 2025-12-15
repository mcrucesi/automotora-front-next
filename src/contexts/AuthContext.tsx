"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import type {
  AuthContextType,
  LoginCredentials,
  User,
  ApiResponse,
} from "@/types/auth";
import { apiClient } from "@/lib/api/client";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Maneja autenticación con httpOnly cookies
 *
 * SECURITY UPDATE:
 * - Ya NO usa localStorage para tokens (previene XSS)
 * - Las cookies se manejan automáticamente por el backend
 * - Simplifica el código del cliente
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Verificar si hay un usuario autenticado al cargar la app
  // Intenta obtener el usuario actual - si hay cookie válida, funcionará
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Intenta obtener datos del usuario actual
        // Si hay una cookie válida, esto funcionará
        const response = await apiClient.get<ApiResponse<User>>("/auth/me");
        setUser(response.data);
      } catch (error) {
        // No hay sesión válida, eso está bien
        console.log("No active session found");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      // El backend ahora envía tokens como httpOnly cookies automáticamente
      const response = await apiClient.post<
        ApiResponse<{ user: User; message: string }>
      >("/auth/login", credentials);

      // Solo recibimos el usuario, NO los tokens (están en cookies)
      const { user: userData } = response.data;

      // Usar flushSync para forzar actualización síncrona del estado
      flushSync(() => {
        setUser(userData);
      });

      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Llamar al endpoint de logout (el backend limpia las cookies)
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      // Limpiar estado local
      setUser(null);
      router.push("/login");
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      // El backend lee el refresh token de la cookie automáticamente
      await apiClient.post<ApiResponse<{ message: string }>>("/auth/refresh");

      // Las cookies se actualizaron automáticamente
      // Obtener el usuario actualizado
      const response = await apiClient.get<ApiResponse<User>>("/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Error al refrescar token:", error);
      // Si falla el refresh, hacer logout
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
