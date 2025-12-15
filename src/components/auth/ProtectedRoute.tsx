'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TokenStorage } from '@/lib/auth/token-storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rutas requiriendo autenticación
 * Redirige al login si el usuario no está autenticado
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar tanto el estado como los tokens en localStorage
    const hasTokens = TokenStorage.hasTokens();

    if (!isLoading && !isAuthenticated && !hasTokens) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-text-subtle">Cargando...</p>
        </div>
      </div>
    );
  }

  // Permitir acceso si está autenticado O si tiene tokens (el estado se actualizará pronto)
  const hasTokens = TokenStorage.hasTokens();
  if (!isAuthenticated && !hasTokens) {
    return null;
  }

  return <>{children}</>;
};
