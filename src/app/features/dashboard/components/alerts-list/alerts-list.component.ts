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
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../../../core/services/document.service';
import { CompanyService } from '../../../../core/services/company.service';
import { DocumentAlert } from '../../../../shared/models/document.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-alerts-list',
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ButtonModule,
    RouterLink,
    LoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card>
      <ng-template #title>
        <div class="card-title">
          <i class="pi pi-bell" aria-hidden="true"></i>
          <span>Alertas</span>
        </div>
      </ng-template>

      @if (loading()) {
        <app-loading />
      } @else if (error()) {
        <div class="error-message" role="alert">
          <p>{{ error() }}</p>
        </div>
      } @else if (alerts().length === 0) {
        <div class="empty-message">
          <i class="pi pi-check-circle" aria-hidden="true"></i>
          <p>Nenhum alerta no momento</p>
        </div>
      } @else {
        <div class="alerts-list">
          @for (alert of alerts(); track alert.document_id) {
            <div class="alert-item" [class]="'alert-' + alert.severity">
              <div class="alert-header">
                <p-tag
                  [value]="severityLabel(alert.severity)"
                  [severity]="alert.severity === 'error' ? 'danger' : alert.severity === 'warning' ? 'warn' : 'info'"
                />
              </div>
              <div class="alert-message">{{ alert.message }}</div>
              <div class="alert-document">
                <span class="document-name">{{ alert.document_name }}</span>
                <p-button
                  label="Ver Documento"
                  [outlined]="true"
                  size="small"
                  [routerLink]="['/documents', alert.document_id]"
                  ariaLabel="Ver documento"
                />
              </div>
            </div>
          }
        </div>
      }
    </p-card>
  `,
  styles: `
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

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .alert-item {
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid;
      background-color: var(--surface-ground);
    }

    .alert-item.alert-info {
      border-left-color: var(--blue-500);
    }

    .alert-item.alert-warning {
      border-left-color: var(--orange-500);
    }

    .alert-item.alert-error {
      border-left-color: var(--red-500);
    }

    .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .alert-date {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .alert-message {
      font-weight: 500;
      margin-bottom: 0.75rem;
      color: var(--text-color);
    }

    .alert-document {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .document-name {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      flex: 1;
    }

    .empty-message {
      text-align: center;
      padding: 2rem;
      color: var(--text-color-secondary);
    }

    .empty-message i {
      font-size: 3rem;
      color: var(--green-500);
      margin-bottom: 1rem;
    }

    .error-message {
      padding: 2rem;
      text-align: center;
      color: var(--red-500);
    }

    @media (max-width: 768px) {
      .alert-document {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `,
})
export class AlertsListComponent implements OnInit {
  private documentService = inject(DocumentService);
  private companyService = inject(CompanyService);

  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly alertsSignal = signal<DocumentAlert[]>([]);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  alerts = this.alertsSignal.asReadonly();

  severityLabel = (severity: string): string => {
    const labels: Record<string, string> = {
      info: 'Informação',
      warning: 'Aviso',
      error: 'Erro',
    };
    return labels[severity] || severity;
  };

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    const companyId = this.companyService.getCompanyId();
    if (!companyId) {
      this.errorSignal.set('Company não encontrada');
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.documentService
      .getAlerts(companyId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.errorSignal.set(err.error?.message || 'Erro ao carregar alertas');
          this.loadingSignal.set(false);
          return of({ alerts: [], count: 0 });
        })
      )
      .subscribe((response) => {
        this.alertsSignal.set(response.alerts);
        this.loadingSignal.set(false);
      });
  }
}

