import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { DocumentService } from '../../../../core/services/document.service';
import { CompanyService } from '../../../../core/services/company.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Document, DocumentStatus } from '../../../../shared/models/document.model';
import { PaginatedResponse } from '../../../../shared/models/api-response.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { STATUS_LABELS } from '../../../../shared/utils/constants';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-document-list',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    TooltipModule,
    StatusBadgeComponent,
    LoadingComponent,
    DatePipe,
  ],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="document-list-container">
      <div class="header-actions">
        <h2>Documentos</h2>
        <div class="filters">
          <p-select
            [options]="statusOptions()"
            [(ngModel)]="selectedStatus"
            placeholder="Filtrar por status"
            [showClear]="true"
            (onChange)="onStatusFilterChange()"
            [ngModelOptions]="{ standalone: true }"
          />
          <input
            type="text"
            pInputText
            placeholder="Buscar por nome..."
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            [ngModelOptions]="{ standalone: true }"
            aria-label="Buscar documentos por nome"
          />
          <p-button
            label="Atualizar"
            icon="pi pi-refresh"
            (onClick)="refreshDocuments()"
            [loading]="loading()"
            aria-label="Atualizar lista de documentos"
          />
          <p-button
            label="Novo Documento"
            icon="pi pi-plus"
            (click)="navigateToCreate()"
            aria-label="Criar novo documento"
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
          [value]="filteredDocuments()"
          [paginator]="true"
          [rows]="pageSize()"
          [totalRecords]="totalRecords()"
          [lazy]="true"
          (onLazyLoad)="onLazyLoad($event)"
          [loading]="loading()"
          [rowsPerPageOptions]="[10, 20, 50]"
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
              <td colspan="4" class="text-center">Nenhum documento encontrado</td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>

    <p-confirmDialog />
  `,
  styles: `
    .document-list-container {
      padding: 2rem;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .error-message {
      padding: 2rem;
      text-align: center;
      color: var(--red-500);
    }
  `,
})
export class DocumentListComponent implements OnInit {
  private documentService = inject(DocumentService);
  private companyService = inject(CompanyService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly documentsSignal = signal<Document[]>([]);
  private readonly totalRecordsSignal = signal<number>(0);
  private readonly currentPageSignal = signal<number>(1);
  private readonly pageSizeSignal = signal<number>(20);
  private readonly selectedStatusSignal = signal<DocumentStatus | null>(null);
  private readonly searchTermSignal = signal<string>('');

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  documents = this.documentsSignal.asReadonly();
  totalRecords = this.totalRecordsSignal.asReadonly();
  currentPage = this.currentPageSignal.asReadonly();
  pageSize = this.pageSizeSignal.asReadonly();
  
  selectedStatus: DocumentStatus | null = null;
  searchTerm: string = '';

  statusOptions = computed(() => {
    const options = Object.entries(STATUS_LABELS).map(([value, label]) => ({
      label,
      value: value as DocumentStatus,
    }));
    return [{ label: 'Todos', value: null }, ...options];
  });

  filteredDocuments = computed(() => {
    let docs = this.documents();
    const status = this.selectedStatusSignal();
    const search = this.searchTermSignal().toLowerCase().trim();

    if (status) {
      docs = docs.filter((doc) => doc.internal_status === status);
    }

    if (search) {
      docs = docs.filter((doc) =>
        doc.name.toLowerCase().includes(search)
      );
    }

    return docs;
  });

  constructor() {
    this.documentService.documentCreated$.subscribe((): void => {
      this.refreshDocuments();
    });
    this.documentService.documentUpdated$.subscribe((): void => {
      this.refreshDocuments();
    });
    this.documentService.documentDeleted$.subscribe((): void => {
      this.refreshDocuments();
    });
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    const companyId = this.companyService.getCompanyId();
    if (!companyId) {
      this.errorSignal.set('Company não encontrada');
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.documentService
      .getDocuments(companyId, this.currentPage(), this.pageSize())
      .pipe(
        catchError((err: HttpErrorResponse | Error) => {
          const errorMessage = err instanceof HttpErrorResponse
            ? err.error?.message || err.message || 'Erro ao carregar documentos'
            : err.message || 'Erro ao carregar documentos';
          this.errorSignal.set(errorMessage);
          this.loadingSignal.set(false);
          return of({ count: 0, results: [], next: null, previous: null } as PaginatedResponse<Document>);
        })
      )
      .subscribe((response: PaginatedResponse<Document>) => {
        this.documentsSignal.set(response.results);
        this.totalRecordsSignal.set(response.count);
        this.loadingSignal.set(false);
      });
  }

  onLazyLoad(event: { first?: number; rows: number }): void {
    const first = event.first ?? 0;
    this.currentPageSignal.set((first / event.rows) + 1);
    this.pageSizeSignal.set(event.rows);
    this.loadDocuments();
  }

  onStatusFilterChange(): void {
    this.selectedStatusSignal.set(this.selectedStatus);
  }

  onSearchChange(): void {
    this.searchTermSignal.set(this.searchTerm);
  }

  refreshDocuments(): void {
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
    const companyId = this.companyService.getCompanyId();
    if (!companyId) {
      this.notificationService.showError('Company não encontrada');
      return;
    }

    this.documentService.deleteDocument(companyId, id).subscribe({
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
  }

  navigateToCreate(): void {
    this.router.navigate(['/documents/create']);
  }
}

