import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly tokenSignal = signal<string | null>(null);

  isAuthenticated = computed(() => this.tokenSignal() !== null);

  constructor() {
    this.init();
  }

  init(): void {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.tokenSignal.set(token);
    }
  }

  login(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.tokenSignal.set(null);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}
