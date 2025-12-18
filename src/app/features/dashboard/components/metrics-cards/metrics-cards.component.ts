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
import { DocumentService } from '../../../../core/services/document.service';
import { CompanyService } from '../../../../core/services/company.service';
import { DocumentMetrics } from '../../../../shared/models/document.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-metrics-cards',
  imports: [CommonModule, CardModule, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-loading />
    } @else if (error()) {
      <div class="error-message" role="alert">
        <p>{{ error() }}</p>
      </div>
    } @else {
      <div class="metrics-cards-grid">
        <p-card class="metric-card">
          <ng-template #title>
            <div class="card-title">
              <i class="pi pi-file" aria-hidden="true"></i>
              <span>Total de Documentos</span>
            </div>
          </ng-template>
          <div class="metric-value">{{ metrics()?.total_documents ?? 0 }}</div>
        </p-card>

        <p-card class="metric-card">
          <ng-template #title>
            <div class="card-title">
              <i class="pi pi-check-circle" aria-hidden="true"></i>
              <span>Taxa de Assinatura</span>
            </div>
          </ng-template>
          <div class="metric-value">
            {{ signatureRate() }}%
          </div>
          <div class="metric-subtitle">
            {{ metrics()?.signed_documents ?? 0 }} de
            {{ metrics()?.total_documents ?? 0 }} assinados
          </div>
        </p-card>

        <p-card class="metric-card">
          <ng-template #title>
            <div class="card-title">
              <i class="pi pi-clock" aria-hidden="true"></i>
              <span>Documentos Pendentes</span>
            </div>
          </ng-template>
          <div class="metric-value pending">
            {{ metrics()?.pending_documents ?? 0 }}
          </div>
        </p-card>

        <p-card class="metric-card">
          <ng-template #title>
            <div class="card-title">
              <i class="pi pi-check" aria-hidden="true"></i>
              <span>Documentos Assinados</span>
            </div>
          </ng-template>
          <div class="metric-value success">
            {{ metrics()?.signed_documents ?? 0 }}
          </div>
        </p-card>
      </div>
    }
  `,
  styles: `
    .metrics-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
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

    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--text-color);
      margin-top: 1rem;
    }

    .metric-value.pending {
      color: var(--orange-500);
    }

    .metric-value.success {
      color: var(--green-500);
    }

    .metric-subtitle {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin-top: 0.5rem;
    }

    .error-message {
      padding: 2rem;
      text-align: center;
      color: var(--red-500);
    }

    @media (max-width: 768px) {
      .metrics-cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class MetricsCardsComponent implements OnInit {
  private documentService = inject(DocumentService);
  private companyService = inject(CompanyService);

  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly metricsSignal = signal<DocumentMetrics | null>(null);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  metrics = this.metricsSignal.asReadonly();

  signatureRate = computed(() => {
    const m = this.metrics();
    if (!m || m.total_documents === 0) {
      return 0;
    }
    return Math.round(m.signature_rate * 100);
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

