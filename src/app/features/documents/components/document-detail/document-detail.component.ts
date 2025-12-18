import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DocumentService } from '../../../../core/services/document.service';
import { CompanyService } from '../../../../core/services/company.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Document } from '../../../../shared/models/document.model';
import { emailValidator } from '../../../../shared/utils/validators';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { HttpErrorResponse } from '@angular/common/http';
import { SignerFormData } from '../../../../shared/models/signer.model';

@Component({
  selector: 'app-document-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    StatusBadgeComponent,
    LoadingComponent,
    DatePipe,
  ],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="document-detail-container">
      @if (loading()) {
        <app-loading />
      } @else if (error()) {
        <div class="error-message" role="alert">
          <p>{{ error() }}</p>
          <p-button label="Voltar" (onClick)="goBack()" />
        </div>
      } @else if (document(); as doc) {
        <div class="header-actions">
          <h2>{{ doc.name }}</h2>
          <div class="action-buttons">
            <p-button
              label="Editar"
              icon="pi pi-pencil"
              (onClick)="editDocument()"
            />
            <p-button
              label="Adicionar Signatário"
              icon="pi pi-user-plus"
              (onClick)="showAddSignerDialog = true"
            />
            <p-button
              label="Cancelar Documento"
              icon="pi pi-times"
              severity="danger"
              (onClick)="confirmCancel()"
              [disabled]="doc.internal_status === 'cancelled' || doc.internal_status === 'completed'"
            />
            <p-button
              label="Atualizar Status"
              icon="pi pi-refresh"
              (onClick)="refreshStatus()"
              [loading]="refreshing()"
            />
            <p-button
              label="Ver Insights"
              icon="pi pi-lightbulb"
              (onClick)="viewInsights()"
            />
          </div>
        </div>

        <div class="document-info">
          <p-card>
            <div class="info-grid">
              <div class="info-item">
                <label>Status:</label>
                <app-status-badge [status]="doc.internal_status" />
              </div>
              <div class="info-item">
                <label>Status do Provider:</label>
                <span>{{ doc.provider_status }}</span>
              </div>
              <div class="info-item">
                <label>Data de Criação:</label>
                <span>{{ doc.created_at | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-item">
                <label>Última Atualização:</label>
                <span>{{ doc.updated_at | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
              @if (doc.date_limit_to_sign) {
                <div class="info-item">
                  <label>Data Limite para Assinatura:</label>
                  <span>{{ doc.date_limit_to_sign | date: 'dd/MM/yyyy HH:mm' }}</span>
                </div>
              }
              <div class="info-item">
                <label>URL do PDF:</label>
                <a [href]="doc.file_url" target="_blank" rel="noopener noreferrer">
                  {{ doc.file_url }}
                </a>
              </div>
            </div>
          </p-card>
        </div>

        <div class="signers-section">
          <h3>Signatários</h3>
          <p-table [value]="doc.signers" [paginator]="false">
            <ng-template pTemplate="header">
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Link de Assinatura</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-signer>
              <tr>
                <td>{{ signer.name }}</td>
                <td>{{ signer.email }}</td>
                <td>
                  <app-status-badge [status]="signer.status" />
                </td>
                <td>
                  @if (signer.sign_url) {
                    <a [href]="signer.sign_url" target="_blank" rel="noopener noreferrer">
                      Assinar
                    </a>
                  } @else {
                    <span>-</span>
                  }
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }

      <!-- Dialog para adicionar signatário -->
      <p-dialog
        [(visible)]="showAddSignerDialog"
        header="Adicionar Signatário"
        [modal]="true"
        [style]="{ width: '500px' }"
      >
        <form [formGroup]="addSignerForm" (ngSubmit)="onAddSigner()">
          <div class="form-group">
            <label for="signer-name">Nome *</label>
            <input
              id="signer-name"
              type="text"
              pInputText
              formControlName="name"
              [class.ng-invalid]="addSignerForm.get('name')?.invalid && addSignerForm.get('name')?.touched"
            />
            @if (addSignerForm.get('name')?.invalid && addSignerForm.get('name')?.touched) {
              <small class="error-message" role="alert">Nome é obrigatório</small>
            }
          </div>
          <div class="form-group">
            <label for="signer-email">Email *</label>
            <input
              id="signer-email"
              type="email"
              pInputText
              formControlName="email"
              [class.ng-invalid]="addSignerForm.get('email')?.invalid && addSignerForm.get('email')?.touched"
            />
            @if (addSignerForm.get('email')?.hasError('required') && addSignerForm.get('email')?.touched) {
              <small class="error-message" role="alert">Email é obrigatório</small>
            }
            @if (addSignerForm.get('email')?.hasError('invalidEmail') && addSignerForm.get('email')?.touched) {
              <small class="error-message" role="alert">Email inválido</small>
            }
          </div>
          <div class="dialog-actions">
            <p-button
              label="Cancelar"
              severity="secondary"
              (onClick)="showAddSignerDialog = false"
            />
            <p-button
              type="submit"
              label="Adicionar"
              [disabled]="addSignerForm.invalid"
            />
          </div>
        </form>
      </p-dialog>

      <p-confirmDialog />
    </div>
  `,
  styles: `
    .document-detail-container {
      padding: 2rem;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .document-info {
      margin-bottom: 2rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-weight: 600;
      color: var(--text-color-secondary);
    }

    .signers-section {
      margin-top: 2rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .error-message {
      color: var(--red-500);
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
    }

    .dialog-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .error-message {
      padding: 2rem;
      text-align: center;
      color: var(--red-500);
    }
  `,
})
export class DocumentDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private documentService = inject(DocumentService);
  private companyService = inject(CompanyService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly refreshingSignal = signal<boolean>(false);
  private readonly documentSignal = signal<Document | null>(null);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  refreshing = this.refreshingSignal.asReadonly();
  document = this.documentSignal.asReadonly();

  showAddSignerDialog = false;

  addSignerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, emailValidator()]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(+id);
    } else {
      this.errorSignal.set('ID do documento não fornecido');
    }
  }

  loadDocument(id: number): void {
    const companyId = this.companyService.getCompanyId();
    if (!companyId) {
      this.errorSignal.set('Company não encontrada');
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.documentService.getDocument(companyId, id).subscribe({
      next: (document: Document) => {
        this.documentSignal.set(document);
        this.loadingSignal.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorSignal.set(err.error?.message || 'Erro ao carregar documento');
        this.loadingSignal.set(false);
      },
    });
  }

  editDocument(): void {
    const doc = this.document();
    if (doc) {
      this.router.navigate(['/documents', doc.id, 'edit']);
    }
  }

  viewInsights(): void {
    const doc = this.document();
    if (doc) {
      this.router.navigate(['/documents', doc.id, 'insights']);
    }
  }

  refreshStatus(): void {
    const doc = this.document();
    const companyId = this.companyService.getCompanyId();
    if (!doc || !companyId) {
      return;
    }

    this.refreshingSignal.set(true);
    this.documentService.refreshStatus(companyId, doc.id).subscribe({
      next: (updatedDocument: Document) => {
        this.documentSignal.set(updatedDocument);
        this.notificationService.showSuccess('Status atualizado com sucesso');
        this.refreshingSignal.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError(
          err.error?.message || 'Erro ao atualizar status'
        );
        this.refreshingSignal.set(false);
      },
    });
  }

  confirmCancel(): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja cancelar este documento?',
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.cancelDocument();
      },
    });
  }

  cancelDocument(): void {
    const doc = this.document();
    const companyId = this.companyService.getCompanyId();
    if (!doc || !companyId) {
      return;
    }

    this.documentService.cancelDocument(companyId, doc.id).subscribe({
      next: (updatedDocument: Document) => {
        this.documentSignal.set(updatedDocument);
        this.notificationService.showSuccess('Documento cancelado com sucesso');
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError(
          err.error?.message || 'Erro ao cancelar documento'
        );
      },
    });
  }

  onAddSigner(): void {
    if (this.addSignerForm.invalid) {
      this.addSignerForm.markAllAsTouched();
      return;
    }

    const doc = this.document();
    const companyId = this.companyService.getCompanyId();
    if (!doc || !companyId) {
      return;
    }

    const signerData: SignerFormData = {
      name: this.addSignerForm.value.name || '',
      email: this.addSignerForm.value.email || '',
    };
    this.documentService.addSigner(companyId, doc.id, signerData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Signatário adicionado com sucesso');
        this.showAddSignerDialog = false;
        this.addSignerForm.reset();
        this.loadDocument(doc.id);
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError(
          err.error?.message || 'Erro ao adicionar signatário'
        );
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/documents']);
  }
}


