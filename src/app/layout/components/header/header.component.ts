import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyService } from '../../../core/services/company.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="header-content">
        <div class="logo-container">
          <div class="logo-icon">
            <i class="pi pi-file-pdf" aria-hidden="true"></i>
          </div>
          <span class="logo-text">ZapSign</span>
        </div>

        <nav class="header-nav">
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link"
          >
            <i class="pi pi-home" aria-hidden="true"></i>
            <span>Dashboard</span>
          </a>
          <a
            routerLink="/documents"
            routerLinkActive="active"
            class="nav-link"
          >
            <i class="pi pi-file" aria-hidden="true"></i>
            <span>Documentos</span>
          </a>
        </nav>

        <div class="header-actions">
          @if (companyName(); as name) {
            <div class="company-badge">
              <i class="pi pi-building" aria-hidden="true"></i>
              <span class="company-name">{{ name }}</span>
            </div>
          }
          <p-button
            label="Sair"
            icon="pi pi-sign-out"
            [outlined]="true"
            severity="secondary"
            (onClick)="logout()"
            ariaLabel="Sair da aplicação"
            styleClass="logout-button"
          />
        </div>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
    }

    .app-header {
      height: 64px;
      background-color: var(--bg-primary);
      border-bottom: var(--border-width) solid var(--border-color);
      box-shadow: var(--shadow-sm);
      position: relative;
    }

    .header-content {
      max-width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--spacing-xl);
      gap: var(--spacing-xl);
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 700;
      font-size: 1.5rem;
      color: var(--primary-color);
      text-decoration: none;
      transition: opacity var(--transition-fast);
      flex-shrink: 0;

      &:hover {
        opacity: 0.8;
      }
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--gradient-primary);
      border-radius: var(--border-radius-md);
      color: white;
      font-size: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .logo-text {
      font-weight: 700;
      letter-spacing: -0.02em;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--border-radius-md);
      transition: all var(--transition-base);
      font-weight: 500;
      font-size: 0.9375rem;
      position: relative;

      i {
        font-size: 1.125rem;
      }

      &:hover {
        background-color: var(--bg-hover);
        color: var(--primary-color);
      }

      &.active {
        color: var(--primary-color);
        background-color: var(--bg-active);

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 2px;
          background: var(--gradient-primary);
          border-radius: var(--border-radius-full);
        }
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-shrink: 0;
    }

    .company-badge {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--bg-secondary);
      border: var(--border-width) solid var(--border-color);
      border-radius: var(--border-radius-md);
      transition: all var(--transition-base);

      &:hover {
        background-color: var(--bg-tertiary);
        border-color: var(--border-color-hover);
      }

      i {
        color: var(--primary-color);
        font-size: 1rem;
      }
    }

    .company-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .logout-button {
      font-weight: 500;
    }

    @media (max-width: 1024px) {
      .header-content {
        padding: 0 var(--spacing-lg);
      }

      .header-nav {
        gap: var(--spacing-xs);
      }

      .nav-link span {
        display: none;
      }

      .nav-link {
        padding: var(--spacing-sm);
        min-width: 40px;
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .logo-text {
        display: none;
      }

      .company-badge .company-name {
        display: none;
      }

      .header-content {
        padding: 0 var(--spacing-md);
        gap: var(--spacing-md);
      }
    }
  `,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private router = inject(Router);


  companyName = computed(() => {
    return this.companyService.currentCompany()?.name ?? null;
  });

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

