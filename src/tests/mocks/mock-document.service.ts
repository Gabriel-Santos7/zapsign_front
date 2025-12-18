import { signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { DocumentService } from '../../app/core/services/document.service';
import { Document, DocumentInsights, DocumentMetrics } from '../../app/shared/models/document.model';
import { PaginatedResponse } from '../../app/shared/models/api-response.model';
import { mockDocument, mockDocumentInsights, mockDocumentMetrics } from '../fixtures/document.fixtures';

export class MockDocumentService {
  documents = signal<Document[]>([]);
  documentCreated$ = new Subject<void>();
  documentUpdated$ = new Subject<void>();
  documentDeleted$ = new Subject<void>();

  getDocuments(
    companyId: number,
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    search?: string
  ) {
    return of<PaginatedResponse<Document>>({
      count: 1,
      next: null,
      previous: null,
      results: [mockDocument],
    });
  }

  createDocument(companyId: number, data: any) {
    return of(mockDocument);
  }

  getDocument(companyId: number, id: number) {
    return of(mockDocument);
  }

  updateDocument(companyId: number, id: number, data: any) {
    return of({ ...mockDocument, ...data });
  }

  deleteDocument(companyId: number, id: number) {
    return of(null);
  }

  getInsights(companyId: number, documentId: number) {
    return of(mockDocumentInsights);
  }

  analyzeDocument(companyId: number, documentId: number) {
    return of(mockDocumentInsights);
  }

  addSigner(companyId: number, documentId: number, signerData: any) {
    return of({ token: 'new-signer-token', sign_url: 'https://example.com/sign/new' });
  }

  cancelDocument(companyId: number, documentId: number) {
    return of({ ...mockDocument, internal_status: 'cancelled' });
  }

  refreshStatus(companyId: number, documentId: number) {
    return of(mockDocument);
  }

  getMetrics(companyId: number) {
    return of(mockDocumentMetrics);
  }

  getAlerts(companyId: number) {
    return of({ alerts: [], count: 0 });
  }
}

