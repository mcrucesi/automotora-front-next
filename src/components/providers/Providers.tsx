'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Componente que envuelve todos los providers de la aplicación
 */
export const Providers = ({ children }: ProvidersProps) => {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          // Estilos por defecto
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          // Estilos por tipo
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
};
