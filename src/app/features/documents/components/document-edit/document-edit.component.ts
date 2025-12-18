import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { DocumentService } from '../../../../core/services/document.service';
import { CompanyService } from '../../../../core/services/company.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UpdateDocumentRequest } from '../../../../shared/models/document.model';
import { pdfUrlValidator, emailValidator } from '../../../../shared/utils/validators';
import { PdfUrlValidatorComponent } from '../../../../shared/components/pdf-url-validator/pdf-url-validator.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Document } from '../../../../shared/models/document.model';
import { Signer } from '../../../../shared/models/signer.model';

@Component({
  selector: 'app-document-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DatePicker,
    TableModule,
    PdfUrlValidatorComponent,
    LoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="document-edit-container">
      <h2>Editar Documento</h2>

      @if (loading()) {
        <app-loading />
      } @else if (error()) {
        <div class="error-message" role="alert">
          <p>{{ error() }}</p>
          <p-button label="Voltar" (onClick)="onCancel()" />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nome do Documento *</label>
            <input
              id="name"
              type="text"
              pInputText
              formControlName="name"
              [class.ng-invalid]="form.get('name')?.invalid && form.get('name')?.touched"
              aria-required="true"
            />
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <small class="error-message" role="alert">
                Nome do documento é obrigatório
              </small>
            }
          </div>

          <div class="form-group">
            <label for="url_pdf">URL do PDF *</label>
            <input
              id="url_pdf"
              type="url"
              pInputText
              formControlName="url_pdf"
              [class.ng-invalid]="form.get('url_pdf')?.invalid && form.get('url_pdf')?.touched"
              aria-required="true"
            />
            <app-pdf-url-validator [control]="form.get('url_pdf')" />
          </div>

          <div class="form-group">
            <label for="date_limit_to_sign">Data Limite para Assinatura</label>
            <p-datepicker
              id="date_limit_to_sign"
              formControlName="date_limit_to_sign"
              [showTime]="true"
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              [minDate]="minDate"
            />
          </div>

          <div class="signers-section">
            <div class="signers-header">
              <h3>Signatários *</h3>
              <p-button
                label="Adicionar Signatário"
                icon="pi pi-plus"
                (onClick)="addSigner()"
                [disabled]="signersFormArray.length >= 10"
              />
            </div>

            <p-table [value]="signersFormArray.controls" [paginator]="false">
              <ng-template pTemplate="header">
                <tr>
                  <th>Nome *</th>
                  <th>Email *</th>
                  <th>Ações</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-control let-index="rowIndex">
                <tr [formGroup]="control">
                  <td>
                    <input
                      type="text"
                      pInputText
                      formControlName="name"
                      [class.ng-invalid]="control.get('name')?.invalid && control.get('name')?.touched"
                    />
                    @if (control.get('name')?.invalid && control.get('name')?.touched) {
                      <small class="error-message" role="alert">Nome é obrigatório</small>
                    }
                  </td>
                  <td>
                    <input
                      type="email"
                      pInputText
                      formControlName="email"
                      [class.ng-invalid]="control.get('email')?.invalid && control.get('email')?.touched"
                    />
                    @if (control.get('email')?.hasError('required') && control.get('email')?.touched) {
                      <small class="error-message" role="alert">Email é obrigatório</small>
                    }
                    @if (control.get('email')?.hasError('invalidEmail') && control.get('email')?.touched) {
                      <small class="error-message" role="alert">Email inválido</small>
                    }
                  </td>
                  <td>
                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      (onClick)="removeSigner(index)"
                      [disabled]="signersFormArray.length === 1"
                    />
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <div class="form-actions">
            <p-button
              label="Cancelar"
              severity="secondary"
              (onClick)="onCancel()"
              [disabled]="submitting()"
            />
            <p-button
              type="submit"
              label="Salvar Alterações"
              [loading]="submitting()"
              [disabled]="form.invalid || submitting()"
            />
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    .document-edit-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
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

    .signers-section {
      margin: 2rem 0;
    }

    .signers-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }
  `,
})
export class DocumentEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private documentService = inject(DocumentService);
  private companyService = inject(CompanyService);
  private notificationService = inject(NotificationService);

  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly submittingSignal = signal<boolean>(false);
  private readonly documentIdSignal = signal<number | null>(null);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  submitting = this.submittingSignal.asReadonly();
  documentId = this.documentIdSignal.asReadonly();

  minDate = new Date();

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    url_pdf: ['', [Validators.required, pdfUrlValidator()]],
    date_limit_to_sign: [null],
    signers: this.fb.array([]),
  });

  get signersFormArray(): FormArray {
    return this.form.get('signers') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.documentIdSignal.set(+id);
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
        this.form.patchValue({
          name: document.name,
          url_pdf: document.file_url,
          date_limit_to_sign: document.date_limit_to_sign
            ? new Date(document.date_limit_to_sign)
            : null,
        });

        // Limpa e preenche signatários
        this.signersFormArray.clear();
        document.signers.forEach((signer: Signer) => {
          this.signersFormArray.push(
            this.fb.group({
              name: [signer.name, [Validators.required]],
              email: [signer.email, [Validators.required, emailValidator()]],
            })
          );
        });

        this.loadingSignal.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorSignal.set(err.error?.message || 'Erro ao carregar documento');
        this.loadingSignal.set(false);
      },
    });
  }

  addSigner(): void {
    const signerGroup = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, emailValidator()]],
    });
    this.signersFormArray.push(signerGroup);
  }

  removeSigner(index: number): void {
    if (this.signersFormArray.length > 1) {
      this.signersFormArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.signersFormArray.length === 0) {
      this.form.markAllAsTouched();
      this.notificationService.showError(
        'Por favor, preencha todos os campos obrigatórios'
      );
      return;
    }

    const documentId = this.documentId();
    const companyId = this.companyService.getCompanyId();

    if (!documentId || !companyId) {
      this.notificationService.showError('Dados inválidos');
      return;
    }

    this.submittingSignal.set(true);

    const formValue = this.form.value;
    const data: UpdateDocumentRequest = {
      name: formValue.name,
      url_pdf: formValue.url_pdf,
      signers: formValue.signers,
      date_limit_to_sign: formValue.date_limit_to_sign
        ? new Date(formValue.date_limit_to_sign).toISOString()
        : undefined,
    };

    this.documentService.updateDocument(companyId, documentId, data).subscribe({
      next: () => {
        this.notificationService.showSuccess('Documento atualizado com sucesso!');
        this.submittingSignal.set(false);
        this.router.navigate(['/documents', documentId]);
      },
      error: (err: HttpErrorResponse) => {
        this.submittingSignal.set(false);
        this.notificationService.showError(
          err.error?.message || 'Erro ao atualizar documento'
        );
      },
    });
  }

  onCancel(): void {
    const documentId = this.documentId();
    if (documentId) {
      this.router.navigate(['/documents', documentId]);
    } else {
      this.router.navigate(['/documents']);
    }
  }
}


