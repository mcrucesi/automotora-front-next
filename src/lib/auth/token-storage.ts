/**
 * Token Storage Service
 * Maneja el almacenamiento seguro de tokens en localStorage
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export class TokenStorage {
  static setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } catch (error) {
        console.error('Error guardando accessToken:', error);
      }
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  }

  static setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } catch (error) {
        console.error('Error guardando refreshToken:', error);
      }
    }
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  static hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}
