import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messageService = inject(MessageService);

  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: message,
    });
  }

  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: message,
    });
  }

  showInfo(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Informação',
      detail: message,
    });
  }

  showInsightNotification(documentId: number): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Análise Disponível',
      detail: 'A análise do documento está disponível',
      data: { documentId },
      life: 10000,
    });
  }
}
