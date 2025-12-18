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
import { PasswordModule } from 'primeng/password';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { CompanyService } from '../../../../core/services/company.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
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
    PasswordModule,
    LoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-container">
      <p-card class="login-card">
        <ng-template #title>
          <div class="login-header">
            <i class="pi pi-file-pdf" aria-hidden="true"></i>
            <h1>ZapSign</h1>
          </div>
        </ng-template>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Usuário</label>
            <input
              id="username"
              type="text"
              pInputText
              formControlName="username"
              [class.ng-invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
              aria-required="true"
              aria-describedby="username-error"
              autocomplete="username"
            />
            @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
              <small id="username-error" class="error-message" role="alert">
                Usuário é obrigatório
              </small>
            }
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <p-password
              id="password"
              formControlName="password"
              [feedback]="false"
              [toggleMask]="true"
              [class.ng-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              aria-required="true"
              aria-describedby="password-error"
              [inputStyle]="{ width: '100%' }"
              autocomplete="current-password"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <small id="password-error" class="error-message" role="alert">
                Senha é obrigatória
              </small>
            }
          </div>

          @if (error()) {
            <div class="error-message" role="alert">
              {{ error() }}
            </div>
          }

          <div class="form-actions">
            <p-button
              label="Entrar"
              type="submit"
              [loading]="submitting()"
              [disabled]="loginForm.invalid"
              styleClass="w-full"
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
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .login-header i {
      font-size: 2rem;
      color: var(--primary-color);
    }

    .login-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-color);
    }

    .form-group input,
    .form-group p-password {
      width: 100%;
    }

    .error-message {
      color: var(--red-500);
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: block;
      padding: 0.75rem;
      background-color: var(--red-50);
      border-radius: 4px;
      border-left: 4px solid var(--red-500);
    }

    .form-actions {
      margin-top: 2rem;
    }

    @media (max-width: 768px) {
      .login-container {
        padding: 1rem;
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

  loginForm!: FormGroup;
  private readonly submittingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  submitting = this.submittingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  constructor() {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

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

