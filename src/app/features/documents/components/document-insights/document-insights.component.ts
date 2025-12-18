import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DocumentService } from '../../../../core/services/document.service';
import { CompanyService } from '../../../../core/services/company.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DocumentInsights } from '../../../../shared/models/document.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-document-insights',
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    CardModule,
    TagModule,
    LoadingComponent,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isDialogMode()) {
      <p-dialog
        [visible]="visible()"
        (visibleChange)="onVisibleChange($event)"
        [header]="'Insights do Documento'"
        [modal]="true"
        [style]="{ width: '800px' }"
        [closable]="true"
        (onHide)="onClose()"
      >
        <ng-container *ngTemplateOutlet="insightsContent"></ng-container>
      </p-dialog>
    } @else {
      <div class="insights-page-container">
        <div class="insights-page-header">
          <h1>Insights do Documento</h1>
          <p-button
            label="Voltar"
            icon="pi pi-arrow-left"
            [outlined]="true"
            (onClick)="goBack()"
            ariaLabel="Voltar para detalhes do documento"
          />
        </div>
        <ng-container *ngTemplateOutlet="insightsContent"></ng-container>
      </div>
    }

    <ng-template #insightsContent>
      @if (loading()) {
        <app-loading />
      } @else if (error()) {
        <div class="error-message" role="alert">
          <p>{{ error() }}</p>
          @if (canForceAnalysis()) {
            <p-button
              label="Forçar Análise"
              (onClick)="forceAnalysis()"
              [loading]="analyzing()"
            />
          }
        </div>
      } @else if (insights(); as ins) {
        <div class="insights-content">
          <p-card class="summary-card">
            <h3>Resumo</h3>
            <p>{{ ins.summary }}</p>
          </p-card>

          @if (ins.missing_topics.length > 0) {
            <p-card class="topics-card">
              <h3>Tópicos Faltantes</h3>
              <ul>
                @for (topic of ins.missing_topics; track topic) {
                  <li>
                    <p-tag [value]="topic" severity="warn" />
                  </li>
                }
              </ul>
            </p-card>
          }

          @if (ins.insights.length > 0) {
            <p-card class="insights-card">
              <h3>Insights Úteis</h3>
              <ul>
                @for (insight of ins.insights; track insight) {
                  <li>{{ insight }}</li>
                }
              </ul>
            </p-card>
          }

          <div class="metadata">
            <small>
              Analisado em: {{ ins.analyzed_at | date: 'dd/MM/yyyy HH:mm' }} |
              Modelo: {{ ins.model_used }}
            </small>
          </div>
        </div>
      }
    </ng-template>
  `,
  styles: `
    .insights-page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .insights-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .insights-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .summary-card,
    .topics-card,
    .insights-card {
      margin-bottom: 1rem;
    }

    .summary-card h3,
    .topics-card h3,
    .insights-card h3 {
      margin-top: 0;
      margin-bottom: 1rem;
    }

    .topics-card ul,
    .insights-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .topics-card li {
      margin-bottom: 0.5rem;
    }

    .insights-card li {
      margin-bottom: 0.75rem;
      padding-left: 1rem;
      position: relative;
    }

    .insights-card li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--primary-color);
    }

    .metadata {
      text-align: right;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .error-message {
      padding: 2rem;
      text-align: center;
      color: var(--red-500);
    }
  `,
})
export class DocumentInsightsComponent implements OnInit {
  documentId = input<number | null>(null);
  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  closed = output<void>();

  private documentService = inject(DocumentService);
  private companyService = inject(CompanyService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly analyzingSignal = signal<boolean>(false);
  private readonly insightsSignal = signal<DocumentInsights | null>(null);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  analyzing = this.analyzingSignal.asReadonly();
  insights = this.insightsSignal.asReadonly();

  // Detecta se está em modo dialog (quando documentId vem do input) ou página (quando vem da rota)
  isDialogMode = computed(() => {
    return this.documentId() !== null && this.documentId() !== undefined;
  });

  ngOnInit(): void {
    // Se documentId vem do input, usa ele; senão tenta pegar da rota
    const idFromInput = this.documentId();
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    const id = idFromInput || (idFromRoute ? +idFromRoute : null);
    
    if (id) {
      this.loadInsights(id);
    }
  }

  canForceAnalysis(): boolean {
    return this.error() !== null && !this.analyzing();
  }

  loadInsights(id: number): void {
    const companyId = this.companyService.getCompanyId();
    if (!companyId) {
      this.errorSignal.set('Company não encontrada');
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.documentService.getInsights(companyId, id).subscribe({
      next: (insights: DocumentInsights) => {
        this.insightsSignal.set(insights);
        this.loadingSignal.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.errorSignal.set('Análise ainda não disponível. Clique em "Forçar Análise" para analisar agora.');
        } else {
          this.errorSignal.set(err.error?.message || 'Erro ao carregar insights');
        }
        this.loadingSignal.set(false);
      },
    });
  }

  forceAnalysis(): void {
    const idFromInput = this.documentId();
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    const id = idFromInput || (idFromRoute ? +idFromRoute : null);
    const companyId = this.companyService.getCompanyId();
    
    if (!id || !companyId) {
      return;
    }

    this.analyzingSignal.set(true);
    this.errorSignal.set(null);

    this.documentService.analyzeDocument(companyId, id).subscribe({
      next: (insights: DocumentInsights) => {
        this.insightsSignal.set(insights);
        this.analyzingSignal.set(false);
        this.notificationService.showSuccess('Análise concluída com sucesso');
      },
      error: (err: HttpErrorResponse) => {
        this.errorSignal.set(err.error?.message || 'Erro ao forçar análise');
        this.analyzingSignal.set(false);
      },
    });
  }

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
    if (!value) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  goBack(): void {
    const idFromInput = this.documentId();
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    const id = idFromInput || (idFromRoute ? +idFromRoute : null);
    
    if (id) {
      this.router.navigate(['/documents', id]);
    } else {
      this.router.navigate(['/documents']);
    }
  }
}
