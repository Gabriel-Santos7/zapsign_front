import { signal, computed } from '@angular/core';
import { AuthService } from '../../app/core/services/auth.service';

export class MockAuthService {
  private readonly tokenSignal = signal<string | null>(null);

  isAuthenticated = computed(() => this.tokenSignal() !== null);

  init(): void {
    // Mock implementation
  }

  login(token: string): void {
    this.tokenSignal.set(token);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('auth_token', token);
    }
  }

  logout(): void {
    this.tokenSignal.set(null);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  // Helper methods for testing
  setToken(token: string | null): void {
    this.tokenSignal.set(token);
  }
}

