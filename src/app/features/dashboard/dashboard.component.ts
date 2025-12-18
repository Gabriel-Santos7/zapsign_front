import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MetricsCardsComponent } from './components/metrics-cards/metrics-cards.component';
import { MetricsChartsComponent } from './components/metrics-charts/metrics-charts.component';
import { AlertsListComponent } from './components/alerts-list/alerts-list.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ButtonModule,
    MetricsCardsComponent,
    MetricsChartsComponent,
    AlertsListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Dashboard</h1>
            <p class="subtitle">Visão geral dos seus documentos e métricas</p>
          </div>
          <p-button
            label="Atualizar"
            icon="pi pi-refresh"
            (onClick)="refreshDashboard()"
            [loading]="refreshing()"
            ariaLabel="Atualizar dashboard"
            [outlined]="true"
            styleClass="refresh-button"
          />
        </div>
      </header>

      <div class="dashboard-content">
        <app-metrics-cards />
        <app-metrics-charts />
        <app-alerts-list />
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      max-width: 100%;
      animation: fadeIn var(--transition-base);
    }

    .dashboard-header {
      margin-bottom: var(--spacing-2xl);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: var(--spacing-lg);
    }

    .title-section {
      flex: 1;
      min-width: 200px;
    }

    .dashboard-header h1 {
      margin: 0 0 var(--spacing-xs) 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.025em;
    }

    .subtitle {
      margin: 0;
      font-size: 0.9375rem;
      color: var(--text-tertiary);
      font-weight: 400;
    }

    .refresh-button {
      font-weight: 500;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xl);
    }

    @media (max-width: 1024px) {
      .dashboard-header h1 {
        font-size: 1.75rem;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .refresh-button {
        width: 100%;
      }

      .dashboard-header h1 {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 0.875rem;
      }
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly refreshingSignal = signal<boolean>(false);

  refreshing = this.refreshingSignal.asReadonly();

  ngOnInit(): void {
    // Componente inicializado
  }

  refreshDashboard(): void {
    this.refreshingSignal.set(true);
    // Recarrega a página para atualizar todos os componentes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}

