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
        <p-card class="metric-card metric-card-primary">
          <ng-template #title>
            <div class="card-title">
              <div class="card-icon icon-primary">
                <i class="pi pi-file" aria-hidden="true"></i>
              </div>
              <span>Total de Documentos</span>
            </div>
          </ng-template>
          <div class="card-content">
            <div class="metric-value">{{ metrics()?.total_documents ?? 0 }}</div>
          </div>
        </p-card>

        <p-card class="metric-card metric-card-success">
          <ng-template #title>
            <div class="card-title">
              <div class="card-icon icon-success">
                <i class="pi pi-check-circle" aria-hidden="true"></i>
              </div>
              <span>Taxa de Assinatura</span>
            </div>
          </ng-template>
          <div class="card-content">
            <div class="metric-value success">
              {{ signatureRate() }}%
            </div>
          </div>
        </p-card>

        <p-card class="metric-card metric-card-warning">
          <ng-template #title>
            <div class="card-title">
              <div class="card-icon icon-warning">
                <i class="pi pi-clock" aria-hidden="true"></i>
              </div>
              <span>Documentos Pendentes</span>
            </div>
          </ng-template>
          <div class="card-content">
            <div class="metric-value warning">
              {{ metrics()?.pending_documents ?? 0 }}
            </div>
          </div>
        </p-card>

        <p-card class="metric-card metric-card-info">
          <ng-template #title>
            <div class="card-title">
              <div class="card-icon icon-info">
                <i class="pi pi-check" aria-hidden="true"></i>
              </div>
              <span>Documentos Assinados</span>
            </div>
          </ng-template>
          <div class="card-content">
            <div class="metric-value info">
              {{ metrics()?.signed_documents ?? 0 }}
            </div>
          </div>
        </p-card>
      </div>
    }
  `,
  styles: `
    .metrics-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-lg);
      animation: fadeIn var(--transition-base);
    }

    .metric-card {
      height: 100%;
      transition: all var(--transition-base);
      border: var(--border-width) solid var(--border-color);
      background-color: var(--bg-primary);
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--border-color-hover);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--gradient-primary);
        opacity: 0;
        transition: opacity var(--transition-base);
      }

      &:hover::before {
        opacity: 1;
      }
    }

    .metric-card-primary::before {
      background: var(--gradient-primary);
    }

    .metric-card-success::before {
      background: linear-gradient(135deg, var(--green-500) 0%, var(--green-600) 100%);
    }

    .metric-card-warning::before {
      background: linear-gradient(135deg, var(--orange-500) 0%, var(--orange-600) 100%);
    }

    .metric-card-info::before {
      background: linear-gradient(135deg, var(--blue-500) 0%, var(--blue-600) 100%);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-md);
    }

    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius-md);
      flex-shrink: 0;
      transition: all var(--transition-base);

      i {
        font-size: 1.25rem;
      }
    }

    .icon-primary {
      background: var(--primary-100);
      color: var(--primary-600);
    }

    .icon-success {
      background: var(--green-100);
      color: var(--green-600);
    }

    .icon-warning {
      background: var(--orange-100);
      color: var(--orange-600);
    }

    .icon-info {
      background: var(--blue-100);
      color: var(--blue-600);
    }

    .card-content {
      margin-top: var(--spacing-md);
    }

    .metric-value {
      font-size: 2.75rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
      letter-spacing: -0.02em;
      margin-bottom: var(--spacing-sm);
    }

    .metric-value.success {
      color: var(--green-600);
    }

    .metric-value.warning {
      color: var(--orange-600);
    }

    .metric-value.info {
      color: var(--blue-600);
    }

    .metric-subtitle {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      margin-top: var(--spacing-sm);
      font-weight: 400;
    }

    .error-message {
      padding: var(--spacing-2xl);
      text-align: center;
      color: var(--red-600);
      background-color: var(--red-50);
      border-radius: var(--border-radius-lg);
      border: var(--border-width) solid var(--red-200);
    }

    @media (max-width: 1024px) {
      .metrics-cards-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--spacing-md);
      }
    }

    @media (max-width: 768px) {
      .metrics-cards-grid {
        grid-template-columns: 1fr;
      }

      .metric-value {
        font-size: 2.25rem;
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
    // signature_rate já vem como porcentagem (0-100) do backend
    return Math.round(m.signature_rate);
  });

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Tenta carregar a company se não estiver disponível
    this.companyService.ensureCompanyLoaded().subscribe({
      next: (company) => {
        if (!company) {
          this.errorSignal.set('Nenhuma empresa encontrada. Por favor, entre em contato com o suporte.');
          this.loadingSignal.set(false);
          return;
        }

        const companyId = company.id;
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
      },
      error: (err) => {
        this.errorSignal.set('Erro ao carregar informações da empresa. Por favor, tente fazer login novamente.');
        this.loadingSignal.set(false);
      },
    });
  }
}

