import {
  Component,
  inject,
  signal,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { DocumentService } from '../../../../core/services/document.service';
import { CompanyService } from '../../../../core/services/company.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CreateDocumentRequest } from '../../../../shared/models/document.model';
import { Company } from '../../../../shared/models/company.model';
import { pdfUrlValidator, emailValidator } from '../../../../shared/utils/validators';
import { PdfUrlValidatorComponent } from '../../../../shared/components/pdf-url-validator/pdf-url-validator.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Document } from '../../../../shared/models/document.model';

@Component({
  selector: 'app-document-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DatePicker,
    TableModule,
    ToastModule,
    SelectModule,
    PdfUrlValidatorComponent,
    LoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="document-create-container">

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="company">Empresa *</label>
          <p-select
            id="company"
            formControlName="company"
            [options]="companies()"
            optionLabel="name"
            optionValue="id"
            [showClear]="false"
            placeholder="Selecione uma empresa"
            [invalid]="form.get('company')?.invalid && form.get('company')?.touched"
            aria-required="true"
            aria-describedby="company-error"
            class="w-full"
          />
          @if (form.get('company')?.invalid && form.get('company')?.touched) {
            <small id="company-error" class="error-message" role="alert">
              Empresa é obrigatória
            </small>
          }
        </div>

        <div class="form-group">
          <label for="name">Nome do Documento *</label>
          <input
            id="name"
            type="text"
            pInputText
            formControlName="name"
            [class.ng-invalid]="form.get('name')?.invalid && form.get('name')?.touched"
            aria-required="true"
            aria-describedby="name-error"
          />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <small id="name-error" class="error-message" role="alert">
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
            aria-describedby="url_pdf-error"
          />
          <app-pdf-url-validator [control]="form.get('url_pdf')" />
          @if (form.get('url_pdf')?.hasError('invalidUrl')) {
            <small id="url_pdf-error" class="error-message" role="alert">
              URL inválida
            </small>
          }
          @if (form.get('url_pdf')?.hasError('invalidPdfExtension')) {
            <small id="url_pdf-error" class="error-message" role="alert">
              A URL deve apontar para um arquivo PDF (.pdf)
            </small>
          }
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
            aria-label="Data limite para assinatura"
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
              aria-label="Adicionar novo signatário"
            />
          </div>

          @if (signersFormArray.length === 0) {
            <p class="no-signers" role="alert">
              Adicione pelo menos um signatário
            </p>
          }

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
                    [attr.aria-label]="'Nome do signatário ' + (index + 1)"
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
                    [attr.aria-label]="'Email do signatário ' + (index + 1)"
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
                    [attr.aria-label]="'Remover signatário ' + (index + 1)"
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
            label="Criar Documento"
            [loading]="submitting()"
            [disabled]="form.invalid || submitting()"
          />
        </div>
      </form>

      @if (submitting()) {
        <app-loading />
      }
    </div>
  `,
  styles: `
    .document-create-container {
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

    .form-group ::ng-deep .p-select {
      width: 100%;
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

    .no-signers {
      padding: 1rem;
      background-color: var(--yellow-50);
      border-left: 4px solid var(--yellow-500);
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
export class DocumentCreateComponent implements OnInit {
  @Output() documentCreated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private companyService = inject(CompanyService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  private readonly submittingSignal = signal<boolean>(false);
  private readonly companiesSignal = signal<Company[]>([]);
  submitting = this.submittingSignal.asReadonly();
  companies = this.companiesSignal.asReadonly();

  minDate = new Date();

  form: FormGroup = this.fb.group({
    company: [null, [Validators.required]],
    name: ['', [Validators.required]],
    url_pdf: ['', [Validators.required, pdfUrlValidator()]],
    date_limit_to_sign: [null],
    signers: this.fb.array([]),
  });

  get signersFormArray(): FormArray {
    return this.form.get('signers') as FormArray;
  }

  ngOnInit(): void {
    // Carrega a lista de empresas
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companiesSignal.set(companies);
        
        // Se houver apenas uma empresa, seleciona automaticamente
        if (companies.length === 1) {
          this.form.patchValue({ company: companies[0].id });
        } else if (companies.length > 0) {
          // Se houver empresa atual, seleciona ela
          const currentCompanyId = this.companyService.getCompanyId();
          if (currentCompanyId) {
            this.form.patchValue({ company: currentCompanyId });
          }
        }
      },
      error: () => {
        this.notificationService.showError('Erro ao carregar empresas');
      },
    });

    // Adiciona um signatário vazio por padrão
    this.addSigner();
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

    const companyId = this.form.value.company;
    if (!companyId) {
      this.notificationService.showError('Selecione uma empresa');
      return;
    }

    this.submittingSignal.set(true);

    const formValue = this.form.value;
    const data: CreateDocumentRequest = {
      name: formValue.name,
      url_pdf: formValue.url_pdf,
      signers: formValue.signers,
      date_limit_to_sign: formValue.date_limit_to_sign
        ? new Date(formValue.date_limit_to_sign).toISOString()
        : undefined,
    };

    this.documentService.createDocument(companyId, data).subscribe({
      next: (document: Document) => {
        this.notificationService.showSuccess(
          'Documento criado com sucesso!'
        );
        this.submittingSignal.set(false);
        
        // Aguarda 10s e verifica insights
        timer(10000).subscribe(() => {
          this.checkInsights(document.id, companyId);
        });

        // Emite evento para o componente pai fechar o drawer
        this.documentCreated.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.submittingSignal.set(false);
        
        let errorMessage = 'Erro ao criar documento';
        
        if (err.error) {
          // Tenta pegar a mensagem de erro do backend
          if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.detail) {
            errorMessage = err.error.detail;
          } else if (err.error.error) {
            errorMessage = err.error.error;
          } else if (typeof err.error === 'string') {
            errorMessage = err.error;
          }
        }
        
        // Mensagens específicas para erros conhecidos
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          errorMessage = 'A URL do PDF não está acessível publicamente. Verifique se o arquivo está disponível e não requer autenticação.';
        } else if (errorMessage.includes('baixar') || errorMessage.includes('download')) {
          errorMessage = 'Não foi possível acessar o PDF na URL fornecida. Verifique se a URL está correta e acessível.';
        }
        
        this.notificationService.showError(errorMessage);
      },
    });
  }

  checkInsights(documentId: number, companyId: number): void {
    this.documentService.getInsights(companyId, documentId).subscribe({
      next: () => {
        this.notificationService.showInsightNotification(documentId);
      },
      error: () => {
        // Insights ainda não disponíveis, não faz nada
      },
    });
  }

  onCancel(): void {
    // Emite evento para fechar o drawer (se estiver em um drawer)
    // Caso contrário, navega de volta
    if (this.documentCreated.observed) {
      // Se há observadores, significa que está em um drawer
      this.documentCreated.emit();
    } else {
      this.router.navigate(['/documents']);
    }
  }
}


