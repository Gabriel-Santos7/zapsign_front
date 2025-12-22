import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService } from './document.service';
import { CompanyService } from './company.service';
import {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentInsights,
  DocumentMetrics,
  DocumentAlertsResponse,
} from '../../shared/models/document.model';
import { PaginatedResponse } from '../../shared/models/api-response.model';
import { environment } from '../../../environments/environment';
import {
  mockDocument,
  mockDocumentInsights,
  mockDocumentMetrics,
  mockDocumentAlerts,
} from '../../../tests/fixtures';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;
  let companyService: CompanyService;
  const apiUrl = environment.apiUrl;
  const companyId = 1;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    TestBed.overrideProvider(CompanyService, {
      useFactory: (http: HttpClient) => new CompanyService(http),
      deps: [HttpClient],
    });
    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
    companyService = TestBed.inject(CompanyService);
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDocuments', () => {
    it('should fetch documents and update cache', async () => {
      const mockResponse: PaginatedResponse<Document> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockDocument],
      };

      let result: PaginatedResponse<Document> | undefined;
      service.getDocuments(companyId, 1, 20).subscribe({
        next: (response) => {
          result = response;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/?page=1&page_size=20`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockResponse);
      expect(service.documents()).toEqual([mockDocument]);
    });

    it('should use default pagination parameters', async () => {
      const mockResponse: PaginatedResponse<Document> = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      let result: PaginatedResponse<Document> | undefined;
      service.getDocuments(companyId).subscribe({
        next: (response) => {
          result = response;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/?page=1&page_size=20`
      );
      req.flush(mockResponse);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDocument', () => {
    it('should fetch a single document', async () => {
      let result: Document | undefined;
      service.getDocument(companyId, mockDocument.id).subscribe({
        next: (document) => {
          result = document;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDocument);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockDocument);
    });
  });

  describe('createDocument', () => {
    it('should create document and emit event', async () => {
      const createData: CreateDocumentRequest = {
        name: 'New Document',
        url_pdf: 'https://example.com/doc.pdf',
        signers: [{ name: 'John Doe', email: 'john@example.com' }],
      };

      let eventEmitted = false;
      service.documentCreated$.subscribe(() => {
        eventEmitted = true;
      });

      let result: Document | undefined;
      service.createDocument(companyId, createData).subscribe({
        next: (document) => {
          result = document;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockDocument);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockDocument);
      expect(eventEmitted).toBe(true);
      expect(service.documents()).toContainEqual(mockDocument);
    });
  });

  describe('updateDocument', () => {
    it('should update document and emit event', async () => {
      const updateData: UpdateDocumentRequest = {
        name: 'Updated Document',
      };

      let eventEmitted = false;
      service.documentUpdated$.subscribe(() => {
        eventEmitted = true;
      });

      let result: Document | undefined;
      service.updateDocument(companyId, mockDocument.id, updateData).subscribe({
        next: (document) => {
          result = document;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/`
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush({ ...mockDocument, ...updateData });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toBeTruthy();
      expect(eventEmitted).toBe(true);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and emit event', async () => {
      // First, populate cache by fetching documents
      const mockResponse: PaginatedResponse<Document> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockDocument],
      };

      service.getDocuments(companyId).subscribe();
      const req1 = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/?page=1&page_size=20`
      );
      req1.flush(mockResponse);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Now test delete
      let eventEmitted = false;
      service.documentDeleted$.subscribe(() => {
        eventEmitted = true;
      });

      service.deleteDocument(companyId, mockDocument.id).subscribe();

      const req2 = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/`
      );
      expect(req2.request.method).toBe('DELETE');
      req2.flush(null);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(eventEmitted).toBe(true);
      expect(service.documents().find((d) => d.id === mockDocument.id)).toBeUndefined();
    });
  });

  describe('getInsights', () => {
    it('should fetch document insights', async () => {
      let result: DocumentInsights | undefined;
      service.getInsights(companyId, mockDocument.id).subscribe({
        next: (insights) => {
          result = insights;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/insights/`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDocumentInsights);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockDocumentInsights);
    });
  });

  describe('analyzeDocument', () => {
    it('should trigger document analysis', async () => {
      let result: DocumentInsights | undefined;
      service.analyzeDocument(companyId, mockDocument.id).subscribe({
        next: (insights) => {
          result = insights;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/analyze/`
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockDocumentInsights);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockDocumentInsights);
    });
  });

  describe('addSigner', () => {
    it('should add signer to document', async () => {
      const signerData = { name: 'Jane Doe', email: 'jane@example.com' };

      let result: any;
      service.addSigner(companyId, mockDocument.id, signerData).subscribe({
        next: (signer) => {
          result = signer;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/add_signer/`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(signerData);
      req.flush({ token: 'signer-token', sign_url: 'https://example.com/sign' });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toBeTruthy();
    });
  });

  describe('cancelDocument', () => {
    it('should cancel document', async () => {
      let result: Document | undefined;
      service.cancelDocument(companyId, mockDocument.id).subscribe({
        next: (document) => {
          result = document;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/cancel/`
      );
      expect(req.request.method).toBe('POST');
      req.flush({ ...mockDocument, internal_status: 'cancelled' });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toBeTruthy();
    });
  });

  describe('refreshStatus', () => {
    it('should refresh document status', async () => {
      let result: Document | undefined;
      service.refreshStatus(companyId, mockDocument.id).subscribe({
        next: (document) => {
          result = document;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/refresh_status/`
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockDocument);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockDocument);
    });
  });

  describe('getMetrics', () => {
    it('should fetch document metrics', async () => {
      let result: DocumentMetrics | undefined;
      service.getMetrics(companyId).subscribe({
        next: (metrics) => {
          result = metrics;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/metrics/`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDocumentMetrics);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockDocumentMetrics);
    });
  });

  describe('getAlerts', () => {
    it('should fetch document alerts', async () => {
      const mockResponse: DocumentAlertsResponse = {
        alerts: mockDocumentAlerts,
        count: mockDocumentAlerts.length,
      };

      let result: DocumentAlertsResponse | undefined;
      service.getAlerts(companyId).subscribe({
        next: (response) => {
          result = response;
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/companies/${companyId}/documents/alerts/`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockResponse);
    });
  });
});

