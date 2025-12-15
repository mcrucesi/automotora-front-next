import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { AuthContextType } from '@/types/auth';

/**
 * Hook para acceder al contexto de autenticación
 * @throws Error si se usa fuera del AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
