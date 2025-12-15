/**
 * API Interceptors
 * Manejo global de errores y respuestas
 */

import { showToast } from '@/lib/utils/toast';
import { APIError, ErrorType } from './errors';

/**
 * Configuración de retry
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableErrors: ErrorType[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  retryDelay: 1000, // 1 segundo
  retryableErrors: [ErrorType.NETWORK, ErrorType.TIMEOUT],
};

/**
 * Interceptor de respuesta
 * Maneja errores comunes y muestra notificaciones apropiadas
 */
export class ResponseInterceptor {
  private retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Maneja errores HTTP y decide qué hacer con ellos
   */
  async handleError(error: APIError): Promise<never> {
    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        type: error.type,
        status: error.status,
        message: error.message,
        endpoint: error.endpoint,
        details: error.details,
      });
    }

    // Manejar según el tipo de error
    switch (error.type) {
      case ErrorType.UNAUTHORIZED:
        this.handleUnauthorized(error);
        break;

      case ErrorType.FORBIDDEN:
        this.handleForbidden(error);
        break;

      case ErrorType.NOT_FOUND:
        this.handleNotFound(error);
        break;

      case ErrorType.VALIDATION:
        this.handleValidation(error);
        break;

      case ErrorType.SERVER:
        this.handleServerError(error);
        break;

      case ErrorType.NETWORK:
        this.handleNetworkError(error);
        break;

      case ErrorType.TIMEOUT:
        this.handleTimeout(error);
        break;

      case ErrorType.RATE_LIMIT:
        this.handleRateLimit(error);
        break;

      default:
        this.handleUnknownError(error);
    }

    // Lanzar el error para que el código que llamó pueda manejarlo también
    throw error;
  }

  /**
   * 401 - Sesión expirada o no autenticado
   */
  private handleUnauthorized(error: APIError): void {
    // Solo redirigir si no estamos ya en la página de login
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      showToast.error('Tu sesión ha expirado. Redirigiendo al login...');

      // Esperar un momento para que el usuario vea el mensaje
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
  }

  /**
   * 403 - Sin permisos
   */
  private handleForbidden(error: APIError): void {
    showToast.error(error.getUserMessage());
  }

  /**
   * 404 - Recurso no encontrado
   */
  private handleNotFound(error: APIError): void {
    // No mostrar toast automáticamente para 404
    // Dejar que el componente decida si mostrar algo
    if (process.env.NODE_ENV === 'development') {
      console.warn('Resource not found:', error.endpoint);
    }
  }

  /**
   * 400 - Error de validación
   */
  private handleValidation(error: APIError): void {
    // Mostrar el mensaje de validación del backend
    const message = error.message || 'Datos inválidos. Por favor revisa el formulario.';
    showToast.error(message);
  }

  /**
   * 500, 502, 503, 504 - Error del servidor
   */
  private handleServerError(error: APIError): void {
    showToast.error(
      'Error en el servidor. Estamos trabajando para solucionarlo. Por favor intenta más tarde.'
    );
  }

  /**
   * Error de red (sin conexión)
   */
  private handleNetworkError(error: APIError): void {
    showToast.error('No hay conexión al servidor. Verifica tu conexión a internet.');
  }

  /**
   * Timeout
   */
  private handleTimeout(error: APIError): void {
    showToast.error('La solicitud tardó demasiado. Por favor intenta nuevamente.');
  }

  /**
   * 429 - Too Many Requests
   */
  private handleRateLimit(error: APIError): void {
    showToast.error(
      'Has realizado demasiadas solicitudes. Por favor espera un momento antes de intentar nuevamente.'
    );
  }

  /**
   * Error desconocido
   */
  private handleUnknownError(error: APIError): void {
    showToast.error(error.getUserMessage());
  }

  /**
   * Intenta reintentar una solicitud fallida
   */
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    error: APIError,
    attempt: number = 0
  ): Promise<T> {
    // No reintentar si no es un error recuperable
    if (!error.isRetryable()) {
      throw error;
    }

    // No reintentar si ya se alcanzó el máximo
    if (attempt >= this.retryConfig.maxRetries) {
      throw error;
    }

    // Esperar antes de reintentar
    await this.delay(this.retryConfig.retryDelay * (attempt + 1));

    try {
      return await requestFn();
    } catch (retryError) {
      if (retryError instanceof APIError) {
        return this.retryRequest(requestFn, retryError, attempt + 1);
      }
      throw retryError;
    }
  }

  /**
   * Utilidad para esperar
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Instancia global del interceptor
 */
export const responseInterceptor = new ResponseInterceptor();
