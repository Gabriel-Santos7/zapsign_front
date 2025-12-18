import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyService } from '../../../core/services/company.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, MenubarModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-menubar [model]="menuItems()" [style]="{ borderRadius: 0 }">
      <ng-template #start>
        <div class="logo-container">
          <i class="pi pi-file-pdf" aria-hidden="true"></i>
          <span class="logo-text">ZapSign</span>
        </div>
      </ng-template>
      <ng-template #end>
        <div class="header-actions">
          @if (companyName(); as name) {
            <span class="company-name">{{ name }}</span>
          }
          <p-button
            label="Sair"
            icon="pi pi-sign-out"
            [outlined]="true"
            severity="secondary"
            (onClick)="logout()"
            ariaLabel="Sair da aplicação"
          />
        </div>
      </ng-template>
    </p-menubar>
  `,
  styles: `
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 1.25rem;
      color: var(--primary-color);
    }

    .logo-container i {
      font-size: 1.5rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .company-name {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      padding: 0.5rem 1rem;
      background-color: var(--surface-ground);
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .logo-text {
        display: none;
      }

      .company-name {
        display: none;
      }
    }
  `,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private router = inject(Router);

  menuItems = computed<MenuItem[]>(() => {
    return [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard',
        routerLinkActiveOptions: { exact: true },
      },
      {
        label: 'Documentos',
        icon: 'pi pi-file',
        routerLink: '/documents',
      },
    ];
  });

  companyName = computed(() => {
    return this.companyService.currentCompany()?.name ?? null;
  });

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

