import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-pdf-url-validator',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (control(); as ctrl) {
      <div class="pdf-validator" [attr.aria-live]="'polite'">
        @if (ctrl.touched || ctrl.dirty) {
          @if (isValid()) {
            <span class="validator-success" aria-label="URL válida">
              <i class="pi pi-check-circle"></i>
              <span>URL PDF válida</span>
            </span>
          } @else if (errorMessage()) {
            <span class="validator-error" [attr.aria-label]="'Erro: ' + errorMessage()">
              <i class="pi pi-times-circle"></i>
              <span>{{ errorMessage() }}</span>
            </span>
          }
        }
      </div>
    }
  `,
  styles: `
    .pdf-validator {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .validator-success {
      color: var(--green-500);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .validator-error {
      color: var(--red-500);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `,
})
export class PdfUrlValidatorComponent {
  control = input.required<AbstractControl | null>();

  isValid = computed(() => {
    const ctrl = this.control();
    if (!ctrl) return false;
    return ctrl.valid && (ctrl.touched || ctrl.dirty);
  });

  errorMessage = computed(() => {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors || !(ctrl.touched || ctrl.dirty)) {
      return null;
    }

    if (ctrl.errors['invalidUrl']) {
      return 'URL inválida';
    }

    if (ctrl.errors['invalidPdfExtension']) {
      return 'A URL deve apontar para um arquivo PDF (.pdf)';
    }

    return null;
  });
}

