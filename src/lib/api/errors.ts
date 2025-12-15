/**
 * API Error Types
 * Define tipos de errores personalizados para mejor manejo
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

export class APIError extends Error {
  public readonly type: ErrorType;
  public readonly status?: number;
  public readonly details?: any;
  public readonly endpoint?: string;

  constructor(
    message: string,
    type: ErrorType,
    status?: number,
    details?: any,
    endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.status = status;
    this.details = details;
    this.endpoint = endpoint;

    // Mantener el stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  /**
   * Crea un APIError a partir de una respuesta HTTP
   */
  static async fromResponse(response: Response, endpoint: string): Promise<APIError> {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    let details = null;
    let type = ErrorType.UNKNOWN;

    // Intentar parsear el cuerpo de la respuesta
    try {
      const data = await response.json();
      message = data.message || data.error || message;
      details = data;
    } catch {
      // Si no se puede parsear, usar el mensaje por defecto
    }

    // Determinar el tipo de error según el código de estado
    switch (response.status) {
      case 400:
        type = ErrorType.VALIDATION;
        break;
      case 401:
        type = ErrorType.UNAUTHORIZED;
        break;
      case 403:
        type = ErrorType.FORBIDDEN;
        break;
      case 404:
        type = ErrorType.NOT_FOUND;
        break;
      case 408:
        type = ErrorType.TIMEOUT;
        break;
      case 429:
        type = ErrorType.RATE_LIMIT;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        type = ErrorType.SERVER;
        break;
      default:
        type = ErrorType.UNKNOWN;
    }

    return new APIError(message, type, response.status, details, endpoint);
  }

  /**
   * Crea un APIError de red (sin conexión, timeout, etc.)
   */
  static network(message: string, endpoint?: string): APIError {
    return new APIError(
      message || 'Error de conexión. Verifica tu conexión a internet.',
      ErrorType.NETWORK,
      undefined,
      undefined,
      endpoint
    );
  }

  /**
   * Verifica si el error es recuperable (se puede reintentar)
   */
  isRetryable(): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.SERVER,
      ErrorType.RATE_LIMIT,
    ].includes(this.type);
  }

  /**
   * Obtiene un mensaje amigable para el usuario
   */
  getUserMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      case ErrorType.UNAUTHORIZED:
        return 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      case ErrorType.FORBIDDEN:
        return 'No tienes permisos para realizar esta acción.';
      case ErrorType.NOT_FOUND:
        return 'El recurso solicitado no fue encontrado.';
      case ErrorType.VALIDATION:
        return this.message || 'Los datos enviados no son válidos.';
      case ErrorType.SERVER:
        return 'Error en el servidor. Por favor intenta más tarde.';
      case ErrorType.TIMEOUT:
        return 'La solicitud tardó demasiado. Por favor intenta nuevamente.';
      case ErrorType.RATE_LIMIT:
        return 'Demasiadas solicitudes. Por favor espera un momento e intenta nuevamente.';
      default:
        return this.message || 'Ocurrió un error inesperado.';
    }
  }
}
