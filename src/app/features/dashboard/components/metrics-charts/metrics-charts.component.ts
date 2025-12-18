import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DocumentService } from '../../../../core/services/document.service';
import { CompanyService } from '../../../../core/services/company.service';
import { DocumentMetrics } from '../../../../shared/models/document.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { STATUS_LABELS } from '../../../../shared/utils/constants';

@Component({
  selector: 'app-metrics-charts',
  imports: [CommonModule, CardModule, ChartModule, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-loading />
    } @else if (error()) {
      <div class="error-message" role="alert">
        <p>{{ error() }}</p>
      </div>
    } @else {
      <div class="charts-grid">
        <p-card class="chart-card">
          <ng-template #title>
            <div class="card-title">
              <i class="pi pi-chart-pie" aria-hidden="true"></i>
              <span>Documentos por Status</span>
            </div>
          </ng-template>
          <p-chart
            type="pie"
            [data]="statusChartData()"
            [options]="pieChartOptions"
            [ariaLabel]="'Gráfico de documentos por status'"
          />
        </p-card>

        <p-card class="chart-card">
          <ng-template #title>
            <div class="card-title">
              <i class="pi pi-chart-bar" aria-hidden="true"></i>
              <span>Documentos por Mês</span>
            </div>
          </ng-template>
          <p-chart
            type="bar"
            [data]="monthlyChartData()"
            [options]="barChartOptions"
            [ariaLabel]="'Gráfico de documentos por mês'"
          />
        </p-card>
      </div>
    }
  `,
  styles: `
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      height: 100%;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .card-title i {
      font-size: 1.25rem;
      color: var(--primary-color);
    }

    .error-message {
      padding: 2rem;
      text-align: center;
      color: var(--red-500);
    }

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class MetricsChartsComponent implements OnInit {
  private documentService = inject(DocumentService);
  private companyService = inject(CompanyService);

  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly metricsSignal = signal<DocumentMetrics | null>(null);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  metrics = this.metricsSignal.asReadonly();

  pieChartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  barChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  statusChartData = computed(() => {
    const m = this.metrics();
    if (!m || !m.status_breakdown) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      };
    }

    const labels: string[] = [];
    const data: number[] = [];
    const colors = [
      '#42A5F5',
      '#66BB6A',
      '#FFA726',
      '#EF5350',
      '#AB47BC',
      '#26A69A',
    ];

    let colorIndex = 0;
    Object.entries(m.status_breakdown).forEach(([status, count]) => {
      labels.push(STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status);
      data.push(count);
      colorIndex++;
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
        },
      ],
    };
  });

  monthlyChartData = computed(() => {
    const m = this.metrics();
    if (!m || !m.documents_by_month) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Documentos',
            data: [],
            backgroundColor: '#42A5F5',
          },
        ],
      };
    }

    const entries = Object.entries(m.documents_by_month).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });

    const labels = entries.map(([month]) => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    });

    const data = entries.map(([, count]) => count);

    return {
      labels,
      datasets: [
        {
          label: 'Documentos',
          data,
          backgroundColor: '#42A5F5',
        },
      ],
    };
  });

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    const companyId = this.companyService.getCompanyId();
    if (!companyId) {
      this.errorSignal.set('Company não encontrada');
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.documentService
      .getMetrics(companyId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.errorSignal.set(
            err.error?.message || 'Erro ao carregar métricas'
          );
          this.loadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe((metrics: DocumentMetrics | null) => {
        if (metrics) {
          this.metricsSignal.set(metrics);
        }
        this.loadingSignal.set(false);
      });
  }
}

