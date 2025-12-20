import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import type { TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmationService } from 'primeng/api';
import { catchError, of, Subject, takeUntil, interval, forkJoin, from, EMPTY } from 'rxjs';
import { DocumentService } from '../../../../core/services/document.service';
import { CompanyService } from '../../../../core/services/company.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Document, DocumentStatus } from '../../../../shared/models/document.model';
import { PaginatedResponse } from '../../../../shared/models/api-response.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { DocumentCreateComponent } from '../document-create/document-create.component';
import { STATUS_LABELS } from '../../../../shared/utils/constants';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-document-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    TooltipModule,
    DrawerModule,
    StatusBadgeComponent,
    LoadingComponent,
    DocumentCreateComponent,
    DatePipe,
  ],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="document-list-container">
      <header class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Documentos</h1>
            <p class="subtitle">Gerencie seus documentos e acompanhe o status das assinaturas</p>
          </div>
          <p-button
            label="Novo Documento"
            icon="pi pi-plus"
            (click)="navigateToCreate()"
            aria-label="Criar novo documento"
            styleClass="create-button"
          />
        </div>
      </header>

      <div class="filters-section">
        <div class="filters">
          <div class="filter-group">
            <label for="status-filter" class="filter-label">
              <i class="pi pi-filter" aria-hidden="true"></i>
              Status
            </label>
            <p-select
              id="status-filter"
              [options]="statusOptions()"
              [(ngModel)]="selectedStatus"
              placeholder="Todos os status"
              [showClear]="true"
              (onChange)="onStatusFilterChange()"
              [ngModelOptions]="{ standalone: true }"
              styleClass="status-filter"
            />
          </div>
          <div class="filter-group">
            <label for="search-input" class="filter-label">
              <i class="pi pi-search" aria-hidden="true"></i>
              Buscar
            </label>
            <input
              id="search-input"
              type="text"
              pInputText
              placeholder="Buscar por nome..."
              [(ngModel)]="searchTerm"
              (input)="onSearchChange()"
              [ngModelOptions]="{ standalone: true }"
              aria-label="Buscar documentos por nome"
              class="search-input"
            />
          </div>
          <p-button
            label="Atualizar"
            icon="pi pi-refresh"
            (onClick)="refreshDocuments()"
            [loading]="loading()"
            aria-label="Atualizar lista de documentos"
            [outlined]="true"
            styleClass="refresh-button"
          />
        </div>
      </div>

      @if (loading()) {
        <app-loading />
      } @else if (error()) {
        <div class="error-message" role="alert">
          <p>{{ error() }}</p>
          <p-button label="Tentar Novamente" (onClick)="refreshDocuments()" />
        </div>
      } @else {
        <p-table
          [value]="documents()"
          [paginator]="true"
          [rows]="pageSize()"
          [totalRecords]="totalRecords()"
          [lazy]="true"
          (onLazyLoad)="onLazyLoad($event)"
          [loading]="loading()"
          [rowsPerPageOptions]="[10, 20, 50]"
          [globalFilterFields]="['name']"
          [rowTrackBy]="trackByDocumentId"
          ariaLabel="Lista de documentos"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Nome</th>
              <th>Status</th>
              <th>Data de Criação</th>
              <th>Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-document>
            <tr>
              <td>{{ document.name }}</td>
              <td>
                <app-status-badge [status]="document.internal_status" />
              </td>
              <td>{{ document.created_at | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <div class="action-buttons">
                  @if (document.internal_status === 'draft') {
                    <p-button
                      icon="pi pi-send"
                      [rounded]="true"
                      [text]="true"
                      (onClick)="sendDraftToSignature(document)"
                      [pTooltip]="'Enviar para Assinatura'"
                      ariaLabel="Enviar rascunho para assinatura"
                      severity="success"
                    />
                  }
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    (onClick)="viewDocument(document.id)"
                    [pTooltip]="'Ver detalhes'"
                    ariaLabel="Ver detalhes do documento"
                  />
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    (onClick)="editDocument(document.id)"
                    [pTooltip]="'Editar'"
                    ariaLabel="Editar documento"
                  />
                  <p-button
                    icon="pi pi-lightbulb"
                    [rounded]="true"
                    [text]="true"
                    (onClick)="viewInsights(document.id)"
                    [pTooltip]="'Ver insights'"
                    ariaLabel="Ver insights do documento"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(document)"
                    [pTooltip]="'Excluir'"
                    ariaLabel="Excluir documento"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="empty-state">
                <div class="empty-content">
                  <i class="pi pi-file" aria-hidden="true"></i>
                  <p>Nenhum documento encontrado</p>
                  <p-button
                    label="Criar Documento"
                    icon="pi pi-plus"
                    (click)="navigateToCreate()"
                    [outlined]="true"
                    styleClass="empty-action-button"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>

    <p-confirmDialog />

    <p-drawer
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      position="right"
      styleClass="document-create-drawer"
      [style]="{ height: '100vh' }"
      [closable]="true"
      header="Criar Novo Documento"
      (onHide)="onDrawerClose()"
    >
      <app-document-create (documentCreated)="onDocumentCreated()" />
    </p-drawer>
  `,
  styles: `
    .document-list-container {
      max-width: 100%;
      animation: fadeIn var(--transition-base);
    }

    .page-header {
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

    .page-header h1 {
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

    .create-button {
      font-weight: 500;
    }

    .filters-section {
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background-color: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      border: var(--border-width) solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }

    .filters {
      display: flex;
      gap: var(--spacing-md);
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      flex: 1;
      min-width: 200px;
    }

    .filter-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);

      i {
        font-size: 0.875rem;
        color: var(--text-tertiary);
      }
    }

    .status-filter,
    .search-input {
      width: 100%;
    }

    .refresh-button {
      font-weight: 500;
      align-self: flex-end;
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-xs);
      justify-content: flex-end;
    }

    .empty-state {
      padding: var(--spacing-3xl) var(--spacing-lg);
      background-color: var(--bg-primary) !important;
      color: var(--text-secondary) !important;
    }

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      text-align: center;
      background-color: var(--bg-primary) !important;
      color: var(--text-secondary) !important;

      i {
        font-size: 3rem;
        color: var(--text-tertiary) !important;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 1rem;
        color: var(--text-secondary) !important;
        font-weight: 500;
      }
    }

    .empty-action-button {
      margin-top: var(--spacing-sm);
    }

    .error-message {
      padding: var(--spacing-2xl);
      text-align: center;
      color: var(--red-600);
      background-color: var(--red-50);
      border-radius: var(--border-radius-lg);
      border: var(--border-width) solid var(--red-200);
    }

    ::ng-deep .p-datatable {
      background-color: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: var(--border-width) solid var(--border-color);

      .p-datatable-thead > tr > th {
        background-color: var(--bg-tertiary);
        font-weight: 600;
        color: var(--text-primary);
        border-bottom: 2px solid var(--border-color);
        padding: var(--spacing-md);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .p-datatable-tbody > tr {
        transition: all var(--transition-fast);
        border-bottom: var(--border-width) solid var(--border-color);

        &:hover {
          background-color: var(--bg-hover);
        }

        &:last-child {
          border-bottom: none;
        }

        td {
          padding: var(--spacing-md);
          color: var(--text-primary);
        }
      }

      .p-datatable-tbody > tr:nth-child(even) {
        background-color: var(--bg-secondary);
      }

      .p-datatable-tbody > tr:nth-child(even):hover {
        background-color: var(--bg-hover);
      }
    }

    @media (max-width: 1024px) {
      .page-header h1 {
        font-size: 1.75rem;
      }

      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-group {
        min-width: 100%;
      }

      .refresh-button {
        align-self: stretch;
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .page-header h1 {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 0.875rem;
      }

      .filters-section {
        padding: var(--spacing-md);
      }

      .action-buttons {
        flex-wrap: wrap;
      }
    }

    /* Estilos para o drawer de criação de documento */
    ::ng-deep .document-create-drawer {
      width: 800px !important;
      height: 100vh !important;
    }
    
    ::ng-deep .document-create-drawer .p-drawer {
      height: 100vh !important;
    }

    @media (max-width: 768px) {
      ::ng-deep .document-create-drawer {
        width: 100vw;
      }
    }

    ::ng-deep .document-create-drawer .p-drawer-content {
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    ::ng-deep app-document-create {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    ::ng-deep app-document-create .document-create-container {
      padding: var(--spacing-lg);
      max-width: 100%;
      margin: 0;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
      min-height: 0;
    }
  `,
})
export class DocumentListComponent implements OnInit, OnDestroy {
  private documentService = inject(DocumentService);
  private companyService = inject(CompanyService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();
  private isLoadingDocuments = false;
  private isUpdatingFromLazyLoad = false;

  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly documentsSignal = signal<Document[]>([]);
  private readonly totalRecordsSignal = signal<number>(0);
  private readonly currentPageSignal = signal<number>(1);
  private readonly pageSizeSignal = signal<number>(20);
  private readonly selectedStatusSignal = signal<DocumentStatus | null>(null);
  private readonly searchTermSignal = signal<string>('');
  private readonly drawerVisibleSignal = signal<boolean>(false);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  documents = this.documentsSignal.asReadonly();
  totalRecords = this.totalRecordsSignal.asReadonly();
  currentPage = this.currentPageSignal.asReadonly();
  pageSize = this.pageSizeSignal.asReadonly();
  drawerVisible = this.drawerVisibleSignal.asReadonly();
  
  selectedStatus: DocumentStatus | null = null;
  searchTerm: string = '';

  statusOptions = computed(() => {
    const options = Object.entries(STATUS_LABELS).map(([value, label]) => ({
      label,
      value: value as DocumentStatus,
    }));
    return [{ label: 'Todos', value: null }, ...options];
  });

  // Removido filteredDocuments - filtragem será feita no backend via parâmetros de query

  constructor() {
    // Usar takeUntil para gerenciar subscriptions e evitar memory leaks
    this.documentService.documentCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((): void => {
        this.refreshDocuments();
      });
    
    this.documentService.documentUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((): void => {
        this.refreshDocuments();
      });
    
    this.documentService.documentDeleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe((): void => {
        this.refreshDocuments();
      });

    // Polling automático para verificar status de documentos pendentes
    this.startStatusPolling();
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    // Evitar múltiplas chamadas simultâneas
    if (this.isLoadingDocuments) {
      return;
    }

    this.isLoadingDocuments = true;
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Tenta carregar a company se não estiver disponível
    this.companyService.ensureCompanyLoaded()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.errorSignal.set('Erro ao carregar informações da empresa. Por favor, tente fazer login novamente.');
          this.loadingSignal.set(false);
          this.isLoadingDocuments = false;
          return of(null);
        })
      )
      .subscribe({
        next: (company) => {
          if (!company) {
            this.errorSignal.set('Nenhuma empresa encontrada. Por favor, entre em contato com o suporte.');
            this.loadingSignal.set(false);
            this.isLoadingDocuments = false;
            return;
          }

          const companyId = company.id;
          const currentPage = this.currentPage();
          const pageSize = this.pageSize();
          
          this.documentService
            .getDocuments(companyId, currentPage, pageSize)
            .pipe(
              takeUntil(this.destroy$),
              catchError((err: HttpErrorResponse | Error) => {
                const errorMessage = err instanceof HttpErrorResponse
                  ? err.error?.message || err.message || 'Erro ao carregar documentos'
                  : err.message || 'Erro ao carregar documentos';
                this.errorSignal.set(errorMessage);
                this.loadingSignal.set(false);
                this.isLoadingDocuments = false;
                return of({ count: 0, results: [], next: null, previous: null } as PaginatedResponse<Document>);
              })
            )
            .subscribe((response: PaginatedResponse<Document>) => {
              // Só atualizar se ainda estamos na mesma página (evitar race conditions)
              if (this.currentPage() === currentPage && this.pageSize() === pageSize) {
                // Usar setTimeout para evitar que o table detecte a mudança e dispare onLazyLoad novamente
                setTimeout(() => {
                  this.documentsSignal.set(response.results);
                  this.totalRecordsSignal.set(response.count);
                }, 0);
              }
              this.loadingSignal.set(false);
              this.isLoadingDocuments = false;
            });
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    // Ignorar se já estiver carregando ou se for uma atualização programática
    if (this.isLoadingDocuments || this.isUpdatingFromLazyLoad) {
      return;
    }

    const first = event.first ?? 0;
    const rows = event.rows ?? 20;
    const newPage = Math.floor(first / rows) + 1;
    const newPageSize = rows;

    // Só recarregar se a página ou tamanho realmente mudou
    const currentPage = this.currentPage();
    const currentPageSize = this.pageSize();
    
    if (currentPage !== newPage || currentPageSize !== newPageSize) {
      this.isUpdatingFromLazyLoad = true;
      
      // Atualizar signals primeiro
      this.currentPageSignal.set(newPage);
      this.pageSizeSignal.set(newPageSize);
      
      // Carregar documentos
      this.loadDocuments();
      
      // Resetar flag após um pequeno delay para permitir que o table atualize
      setTimeout(() => {
        this.isUpdatingFromLazyLoad = false;
      }, 100);
    }
  }

  onStatusFilterChange(): void {
    this.selectedStatusSignal.set(this.selectedStatus);
    // Resetar para primeira página quando filtrar
    if (this.currentPage() !== 1) {
      this.currentPageSignal.set(1);
      this.loadDocuments();
    }
  }

  onSearchChange(): void {
    this.searchTermSignal.set(this.searchTerm);
    // Resetar para primeira página quando buscar
    if (this.currentPage() !== 1) {
      this.currentPageSignal.set(1);
      this.loadDocuments();
    }
  }

  refreshDocuments(): void {
    // Resetar flag para permitir nova requisição
    this.isLoadingDocuments = false;
    this.currentPageSignal.set(1);
    this.loadDocuments();
  }

  viewDocument(id: number): void {
    this.router.navigate(['/documents', id]);
  }

  editDocument(id: number): void {
    this.router.navigate(['/documents', id, 'edit']);
  }

  viewInsights(id: number): void {
    this.router.navigate(['/documents', id, 'insights']);
  }

  sendDraftToSignature(document: Document): void {
    if (document.internal_status !== 'draft') {
      this.notificationService.showError('Apenas documentos em rascunho podem ser enviados para assinatura.');
      return;
    }

    this.companyService.ensureCompanyLoaded()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company) => {
          if (!company) {
            this.notificationService.showError('Nenhuma empresa encontrada. Por favor, entre em contato com o suporte.');
            return;
          }

          const companyId = company.id;
          this.documentService.sendDraftToSignature(companyId, document.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.notificationService.showSuccess('Documento enviado para assinatura com sucesso!');
                this.refreshDocuments();
              },
              error: (err: HttpErrorResponse) => {
                const errorMessage = err.error?.message || err.error?.detail || 'Erro ao enviar documento para assinatura';
                this.notificationService.showError(errorMessage);
              },
            });
        },
        error: () => {
          this.notificationService.showError('Erro ao carregar informações da empresa. Por favor, tente fazer login novamente.');
        },
      });
  }

  confirmDelete(document: Document): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o documento "${document.name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.deleteDocument(document.id);
      },
    });
  }

  deleteDocument(id: number): void {
    this.companyService.ensureCompanyLoaded()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company) => {
          if (!company) {
            this.notificationService.showError('Nenhuma empresa encontrada. Por favor, entre em contato com o suporte.');
            return;
          }

          const companyId = company.id;
          this.documentService.deleteDocument(companyId, id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.notificationService.showSuccess('Documento excluído com sucesso');
                this.refreshDocuments();
              },
              error: (err: HttpErrorResponse) => {
                this.notificationService.showError(
                  err.error?.message || 'Erro ao excluir documento'
                );
              },
            });
        },
        error: () => {
          this.notificationService.showError('Erro ao carregar informações da empresa. Por favor, tente fazer login novamente.');
        },
      });
  }

  navigateToCreate(): void {
    this.drawerVisibleSignal.set(true);
  }

  onDrawerClose(): void {
    this.drawerVisibleSignal.set(false);
  }

  onDocumentCreated(): void {
    this.drawerVisibleSignal.set(false);
    this.refreshDocuments();
  }

  onDrawerVisibleChange(visible: boolean): void {
    this.drawerVisibleSignal.set(visible);
  }

  /**
   * Inicia polling automático para verificar mudanças de status
   * Verifica apenas documentos pendentes ou em progresso a cada 30 segundos
   */
  private startStatusPolling(): void {
    interval(30000) // 30 segundos
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const companyId = this.companyService.getCompanyId();
        if (!companyId) {
          return;
        }

        // Busca apenas documentos que precisam ser verificados
        const docsToCheck = this.documentsSignal().filter(
          (doc) =>
            doc.internal_status === 'pending' ||
            doc.internal_status === 'in_progress'
        );

        if (docsToCheck.length === 0) {
          return;
        }

        // Verifica o status de cada documento pendente em paralelo
        const statusChecks = docsToCheck.map((doc) =>
          this.documentService
            .checkDocumentStatus(companyId, doc.id)
            .pipe(catchError(() => of(null)))
        );

        forkJoin(statusChecks)
          .pipe(takeUntil(this.destroy$))
          .subscribe((updatedDocs: (Document | null)[]) => {
            updatedDocs.forEach((updatedDoc) => {
              if (!updatedDoc) {
                return;
              }

              // Atualiza o documento na lista se o status mudou
              const currentDocs = this.documentsSignal();
              const index = currentDocs.findIndex((d) => d.id === updatedDoc.id);
              if (index !== -1) {
                const currentDoc = currentDocs[index];
                if (currentDoc.internal_status !== updatedDoc.internal_status) {
                  // Status mudou, atualiza a lista
                  this.documentsSignal.update((docs) => {
                    const updated = [...docs];
                    updated[index] = updatedDoc;
                    return updated;
                  });

                  // Notifica se foi assinado (completed)
                  if (updatedDoc.internal_status === 'completed') {
                    this.notificationService.showSuccess(
                      `Documento "${updatedDoc.name}" foi assinado!`
                    );
                  }
                }
              }
            });
          });
      });
  }

  trackByDocumentId(index: number, document: Document): number {
    return document.id;
  }
}

