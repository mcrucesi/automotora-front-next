'use client';

import { useState, FormEvent } from 'react';
import { Card, Button } from '@/components/ui';
import { Car, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      // La redirección se maneja en el AuthContext
    } catch (err: any) {
      const errorMessage = err?.message || 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-500 rounded-full">
              <Car size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-text-main">
            AutoDealer
          </h1>
          <p className="text-text-subtle mt-1">
            Ingresa a tu cuenta
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg flex items-start gap-2">
            <AlertCircle className="text-error flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-main mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-main mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            size="lg"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <p className="text-center text-sm text-text-subtle mt-4">
          ¿Olvidaste tu contraseña?{' '}
          <a href="#" className="text-primary-500 hover:text-primary-700 font-medium">
            Recuperar
          </a>
        </p>
      </Card>
    </div>
  );
}
