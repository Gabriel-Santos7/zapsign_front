import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService, MessageService],
    });
    service = TestBed.inject(NotificationService);
    messageService = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showSuccess', () => {
    it('should call MessageService.add with success message', () => {
      const addSpy = vi.spyOn(messageService, 'add');
      const message = 'Operação realizada com sucesso';

      service.showSuccess(message);

      expect(addSpy).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Sucesso',
        detail: message,
      });
    });
  });

  describe('showError', () => {
    it('should call MessageService.add with error message', () => {
      const addSpy = vi.spyOn(messageService, 'add');
      const message = 'Erro ao processar solicitação';

      service.showError(message);

      expect(addSpy).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Erro',
        detail: message,
      });
    });
  });

  describe('showInfo', () => {
    it('should call MessageService.add with info message', () => {
      const addSpy = vi.spyOn(messageService, 'add');
      const message = 'Informação importante';

      service.showInfo(message);

      expect(addSpy).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Informação',
        detail: message,
      });
    });
  });

  describe('showInsightNotification', () => {
    it('should call MessageService.add with insight notification', () => {
      const addSpy = vi.spyOn(messageService, 'add');
      const documentId = 123;

      service.showInsightNotification(documentId);

      expect(addSpy).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Análise Disponível',
        detail: 'A análise do documento está disponível',
        data: { documentId },
        life: 10000,
      });
    });
  });
});

