/**
 * API Client Configuration
 * Cliente HTTP para comunicarse con el backend NestJS
 *
 * SECURITY UPDATE: Ahora usa httpOnly cookies en lugar de localStorage
 * - Las cookies se envían automáticamente con credentials: 'include'
 * - No se manejan tokens manualmente (más seguro contra XSS)
 *
 * ERROR HANDLING: Manejo global de errores con interceptores
 * - Errores tipados (APIError)
 * - Retry automático para errores de red
 * - Notificaciones toast automáticas
 * - Manejo específico por código de estado HTTP
 */

import { APIError, ErrorType } from './errors';
import { responseInterceptor } from './interceptors';

// Base URL del API con prefijo global /api/v1
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://localhost:3000/api/v1';
const DEFAULT_TIMEOUT = 30000; // 30 segundos

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
  skipErrorHandling?: boolean; // Para casos donde queremos manejar el error manualmente
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, timeout = DEFAULT_TIMEOUT, skipErrorHandling = false, ...fetchOptions } = options;

    // Construir URL con parámetros
    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    // Detectar si el body es FormData
    const isFormData = fetchOptions.body instanceof FormData;

    // Configuración por defecto
    const config: RequestInit = {
      ...fetchOptions,
      credentials: 'include', // IMPORTANTE: Envía cookies automáticamente
      headers: {
        // Solo establecer Content-Type si NO es FormData
        // FormData necesita que el navegador establezca el boundary automáticamente
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...fetchOptions.headers,
      },
    };

    try {
      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Si la respuesta no es OK, crear un APIError
      if (!response.ok) {
        const error = await APIError.fromResponse(response, endpoint);

        // Si skipErrorHandling es true, lanzar el error sin pasar por el interceptor
        if (skipErrorHandling) {
          throw error;
        }

        // Pasar por el interceptor para manejo global
        await responseInterceptor.handleError(error);
      }

      // Intentar parsear la respuesta como JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      // Si no es JSON, retornar el texto
      return (await response.text()) as unknown as T;
    } catch (error) {
      // Manejar errores de red o timeout
      if (error instanceof APIError) {
        // Ya es un APIError, re-lanzarlo
        throw error;
      }

      // Crear APIError apropiado según el tipo de error
      let apiError: APIError;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Timeout
          apiError = new APIError(
            'La solicitud tardó demasiado tiempo',
            ErrorType.TIMEOUT,
            408,
            undefined,
            endpoint
          );
        } else if (error.message.includes('fetch')) {
          // Error de red
          apiError = APIError.network(
            'No se pudo conectar al servidor. Verifica tu conexión a internet.',
            endpoint
          );
        } else {
          // Error desconocido
          apiError = new APIError(
            error.message,
            ErrorType.UNKNOWN,
            undefined,
            undefined,
            endpoint
          );
        }
      } else {
        // Error completamente desconocido
        apiError = new APIError(
          'Ocurrió un error inesperado',
          ErrorType.UNKNOWN,
          undefined,
          error,
          endpoint
        );
      }

      // Si skipErrorHandling es true, lanzar sin interceptor
      if (skipErrorHandling) {
        throw apiError;
      }

      // Pasar por el interceptor
      await responseInterceptor.handleError(apiError);
    }
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      // Si es FormData, enviarlo directamente. Si no, convertir a JSON
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new APIClient(API_BASE_URL);

// Re-exportar tipos y clases útiles
export { APIError, ErrorType } from './errors';
export type { FetchOptions };
