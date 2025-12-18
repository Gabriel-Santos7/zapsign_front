import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function pdfUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const url = control.value as string;

    // Verifica se é uma URL válida
    try {
      new URL(url);
    } catch {
      return { invalidUrl: { value: control.value } };
    }

    // Verifica se termina com .pdf (antes de query params ou fragments)
    const urlWithoutQuery = url.split('?')[0].split('#')[0];
    if (!urlWithoutQuery.toLowerCase().endsWith('.pdf')) {
      return { invalidPdfExtension: { value: control.value } };
    }

    return null;
  };
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const email = control.value as string;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { invalidEmail: { value: control.value } };
    }

    return null;
  };
}
