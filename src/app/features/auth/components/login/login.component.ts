import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { CompanyService } from '../../../../core/services/company.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { API_BASE_URL } from '../../../../shared/utils/constants';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-container">
      <div class="login-background">
        <div class="background-shape shape-1"></div>
        <div class="background-shape shape-2"></div>
        <div class="background-shape shape-3"></div>
      </div>
      <p-card class="login-card">
        <ng-template #title>
          <div class="login-header">
            <div class="logo-icon">
              <i class="pi pi-file-pdf" aria-hidden="true"></i>
            </div>
            <h1>ZapSign</h1>
            <p class="login-subtitle">Gestão de Documentos</p>
          </div>
        </ng-template>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">
              <i class="pi pi-user" aria-hidden="true"></i>
              Usuário
            </label>
            <input
              id="username"
              type="text"
              pInputText
              formControlName="username"
              [class.ng-invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
              aria-required="true"
              aria-describedby="username-error"
              autocomplete="username"
              placeholder="Digite seu usuário"
              class="form-input"
            />
            @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
              <small id="username-error" class="error-message" role="alert">
                <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
                Usuário é obrigatório
              </small>
            }
          </div>

          <div class="form-group">
            <label for="password" class="form-label">
              <i class="pi pi-lock" aria-hidden="true"></i>
              Senha
            </label>
            <input
              id="password"
              type="password"
              pInputText
              formControlName="password"
              [class.ng-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              aria-required="true"
              aria-describedby="password-error"
              autocomplete="current-password"
              placeholder="Digite sua senha"
              class="form-input"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <small id="password-error" class="error-message" role="alert">
                <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
                Senha é obrigatória
              </small>
            }
          </div>

          @if (error()) {
            <div class="error-message error-alert" role="alert">
              <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
              <span>{{ error() }}</span>
            </div>
          }

          <div class="form-actions">
            <p-button
              label="Entrar"
              type="submit"
              [loading]="submitting()"
              [disabled]="loginForm.invalid"
              styleClass="login-button"
              ariaLabel="Fazer login"
            />
          </div>
        </form>
      </p-card>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: var(--spacing-xl);
      position: relative;
      background: var(--gradient-light);
      overflow: hidden;
    }

    .login-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
      overflow: hidden;
    }

    .background-shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
      filter: blur(60px);
    }

    .shape-1 {
      width: 400px;
      height: 400px;
      background: var(--primary-400);
      top: -200px;
      right: -200px;
      animation: float 20s ease-in-out infinite;
    }

    .shape-2 {
      width: 300px;
      height: 300px;
      background: var(--blue-400);
      bottom: -150px;
      left: -150px;
      animation: float 15s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 200px;
      height: 200px;
      background: var(--primary-300);
      top: 50%;
      left: 10%;
      animation: float 25s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
      }
      33% {
        transform: translate(30px, -30px) rotate(120deg);
      }
      66% {
        transform: translate(-20px, 20px) rotate(240deg);
      }
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      position: relative;
      z-index: 1;
      background-color: var(--bg-primary);
      box-shadow: var(--shadow-xl);
      border: var(--border-width) solid var(--border-color);
      animation: slideIn var(--transition-base);
    }

    .login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      text-align: center;
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: var(--gradient-primary);
      border-radius: var(--border-radius-xl);
      color: white;
      font-size: 2rem;
      box-shadow: var(--shadow-md);
      margin-bottom: var(--spacing-xs);
    }

    .login-header h1 {
      margin: 0;
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.025em;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .login-subtitle {
      margin: 0;
      font-size: 0.9375rem;
      color: var(--text-tertiary);
      font-weight: 400;
    }

    .login-form {
      margin-top: var(--spacing-lg);
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-sm);
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--text-secondary);

      i {
        font-size: 0.875rem;
        color: var(--text-tertiary);
      }
    }

    .form-input {
      width: 100%;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--red-600);
      font-size: 0.875rem;
      margin-top: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--red-50);
      border-radius: var(--border-radius-md);
      border: var(--border-width) solid var(--red-200);
      animation: slideIn var(--transition-fast);

      i {
        font-size: 1rem;
        flex-shrink: 0;
      }
    }

    .error-alert {
      margin-top: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .form-actions {
      margin-top: var(--spacing-2xl);
    }

    .login-button {
      width: 100%;
      font-weight: 600;
      font-size: 1rem;
      padding: var(--spacing-md);
      background: var(--gradient-primary);
      border: none;
      box-shadow: var(--shadow-md);

      &:hover:not(:disabled) {
        box-shadow: var(--shadow-lg);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }


    @media (max-width: 768px) {
      .login-container {
        padding: var(--spacing-md);
      }

      .login-card {
        max-width: 100%;
      }

      .login-header h1 {
        font-size: 1.875rem;
      }

      .logo-icon {
        width: 56px;
        height: 56px;
        font-size: 1.75rem;
      }
    }
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });
  
  private readonly submittingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  submitting = this.submittingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submittingSignal.set(true);
    this.errorSignal.set(null);

    const credentials: LoginRequest = this.loginForm.value;

    this.http
      .post<LoginResponse>(`${API_BASE_URL}/api-token-auth/`, credentials)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMessage =
            err.error?.detail ||
            err.error?.non_field_errors?.[0] ||
            'Erro ao fazer login. Verifique suas credenciais.';
          this.errorSignal.set(errorMessage);
          this.submittingSignal.set(false);
          return of(null);
        })
      )
      .subscribe((response: LoginResponse | null) => {
        if (response?.token) {
          this.authService.login(response.token);
          this.notificationService.showSuccess('Login realizado com sucesso!');

          // Carrega a company e redireciona
          this.companyService.loadCompany().subscribe({
            next: () => {
              const returnUrl =
                this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
              this.router.navigate([returnUrl]);
            },
            error: () => {
              // Mesmo sem company, redireciona para dashboard
              const returnUrl =
                this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
              this.router.navigate([returnUrl]);
            },
          });
        }
        this.submittingSignal.set(false);
      });
  }
}

