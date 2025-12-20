import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, tap, interval, switchMap, filter, takeWhile } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyService } from './company.service';
import {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentInsights,
  DocumentMetrics,
  DocumentAlertsResponse,
} from '../../shared/models/document.model';
import { Signer } from '../../shared/models/signer.model';
import { PaginatedResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private companyService = inject(CompanyService);

  private readonly documentsCache = signal<Document[]>([]);

  documentCreated$ = new Subject<void>();
  documentUpdated$ = new Subject<void>();
  documentDeleted$ = new Subject<void>();

  documents = this.documentsCache.asReadonly();

  getDocuments(
    companyId: number,
    page: number = 1,
    pageSize: number = 20
  ): Observable<PaginatedResponse<Document>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http
      .get<PaginatedResponse<Document>>(
        `${this.apiUrl}/companies/${companyId}/documents/`,
        { params }
      )
      .pipe(
        tap((response) => {
          this.documentsCache.set(response.results);
        })
      );
  }

  getDocument(companyId: number, documentId: number): Observable<Document> {
    return this.http.get<Document>(
      `${this.apiUrl}/companies/${companyId}/documents/${documentId}/`
    );
  }

  createDocument(
    companyId: number,
    data: CreateDocumentRequest
  ): Observable<Document> {
    return this.http
      .post<Document>(
        `${this.apiUrl}/companies/${companyId}/documents/`,
        data
      )
      .pipe(
        tap((document) => {
          this.documentCreated$.next();
          this.documentsCache.update((docs) => [document, ...docs]);
        })
      );
  }

  updateDocument(
    companyId: number,
    documentId: number,
    data: UpdateDocumentRequest
  ): Observable<Document> {
    return this.http
      .patch<Document>(
        `${this.apiUrl}/companies/${companyId}/documents/${documentId}/`,
        data
      )
      .pipe(
        tap(() => {
          this.documentUpdated$.next();
        })
      );
  }

  deleteDocument(companyId: number, documentId: number): Observable<void> {
    return this.http
      .delete<void>(
        `${this.apiUrl}/companies/${companyId}/documents/${documentId}/`
      )
      .pipe(
        tap(() => {
          this.documentDeleted$.next();
          this.documentsCache.update((docs) =>
            docs.filter((doc) => doc.id !== documentId)
          );
        })
      );
  }

  getInsights(
    companyId: number,
    documentId: number
  ): Observable<DocumentInsights> {
    return this.http.get<DocumentInsights>(
      `${this.apiUrl}/companies/${companyId}/documents/${documentId}/insights/`
    );
  }

  analyzeDocument(
    companyId: number,
    documentId: number
  ): Observable<DocumentInsights> {
    return this.http.post<DocumentInsights>(
      `${this.apiUrl}/companies/${companyId}/documents/${documentId}/analyze/`,
      {}
    );
  }

  addSigner(
    companyId: number,
    documentId: number,
    signerData: { name: string; email: string }
  ): Observable<Signer> {
    return this.http.post<Signer>(
      `${this.apiUrl}/companies/${companyId}/documents/${documentId}/add_signer/`,
      signerData
    );
  }

  cancelDocument(companyId: number, documentId: number): Observable<Document> {
    return this.http.post<Document>(
      `${this.apiUrl}/companies/${companyId}/documents/${documentId}/cancel/`,
      {}
    );
  }

  refreshStatus(
    companyId: number,
    documentId: number
  ): Observable<Document> {
    return this.http.post<Document>(
      `${this.apiUrl}/companies/${companyId}/documents/${documentId}/refresh_status/`,
      {}
    );
  }

  sendDraftToSignature(
    companyId: number,
    documentId: number
  ): Observable<Document> {
    return this.http.post<Document>(
      `${this.apiUrl}/companies/${companyId}/documents/${documentId}/send_to_signature/`,
      {}
    ).pipe(
      tap(() => {
        this.documentUpdated$.next();
      })
    );
  }

  getMetrics(companyId: number): Observable<DocumentMetrics> {
    return this.http.get<DocumentMetrics>(
      `${this.apiUrl}/companies/${companyId}/documents/metrics/`
    );
  }

  getAlerts(companyId: number): Observable<DocumentAlertsResponse> {
    return this.http.get<DocumentAlertsResponse>(
      `${this.apiUrl}/companies/${companyId}/documents/alerts/`
    );
  }

  /**
   * Atualiza o status de um documento específico
   * Útil para polling automático
   */
  checkDocumentStatus(
    companyId: number,
    documentId: number
  ): Observable<Document> {
    return this.refreshStatus(companyId, documentId).pipe(
      tap((updatedDoc) => {
        // Atualiza o cache se o documento estiver lá
        this.documentsCache.update((docs) => {
          const index = docs.findIndex((d) => d.id === documentId);
          if (index !== -1) {
            const updated = [...docs];
            updated[index] = updatedDoc;
            return updated;
          }
          return docs;
        });
        this.documentUpdated$.next();
      })
    );
  }
}
