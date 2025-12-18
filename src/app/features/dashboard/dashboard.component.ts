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
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p-button
          label="Atualizar"
          icon="pi pi-refresh"
          (onClick)="refreshDashboard()"
          [loading]="refreshing()"
          ariaLabel="Atualizar dashboard"
        />
      </div>

      <app-metrics-cards />
      <app-metrics-charts />
      <app-alerts-list />
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: 2rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
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

