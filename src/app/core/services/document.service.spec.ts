import { TestBed } from '@angular/core/testing';
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

      await new Promise<void>((resolve) => {
        service.getDocuments(companyId, 1, 20).subscribe({
          next: (response) => {
            expect(response).toEqual(mockResponse);
            expect(service.documents()).toEqual([mockDocument]);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/?page=1&page_size=20`
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });
    });

    it('should use default pagination parameters', async () => {
      const mockResponse: PaginatedResponse<Document> = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      await new Promise<void>((resolve) => {
        service.getDocuments(companyId).subscribe({
          next: (response) => {
            expect(response).toEqual(mockResponse);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/?page=1&page_size=20`
        );
        req.flush(mockResponse);
      });
    });
  });

  describe('getDocument', () => {
    it('should fetch a single document', async () => {
      await new Promise<void>((resolve) => {
        service.getDocument(companyId, mockDocument.id).subscribe({
          next: (document) => {
            expect(document).toEqual(mockDocument);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/`
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockDocument);
      });
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

      await new Promise<void>((resolve) => {
        service.createDocument(companyId, createData).subscribe({
          next: (document) => {
            expect(document).toEqual(mockDocument);
            expect(eventEmitted).toBe(true);
            expect(service.documents()).toContainEqual(mockDocument);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/`
        );
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(createData);
        req.flush(mockDocument);
      });
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

      await new Promise<void>((resolve) => {
        service.updateDocument(companyId, mockDocument.id, updateData).subscribe({
          next: (document) => {
            expect(document).toBeTruthy();
            expect(eventEmitted).toBe(true);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/`
        );
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(updateData);
        req.flush({ ...mockDocument, ...updateData });
      });
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and emit event', async () => {
      // First, populate cache
      service.documents().push(mockDocument);

      let eventEmitted = false;
      service.documentDeleted$.subscribe(() => {
        eventEmitted = true;
      });

      await new Promise<void>((resolve) => {
        service.deleteDocument(companyId, mockDocument.id).subscribe({
          next: () => {
            expect(eventEmitted).toBe(true);
            expect(service.documents().find((d) => d.id === mockDocument.id)).toBeUndefined();
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/`
        );
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
      });
    });
  });

  describe('getInsights', () => {
    it('should fetch document insights', async () => {
      await new Promise<void>((resolve) => {
        service.getInsights(companyId, mockDocument.id).subscribe({
          next: (insights) => {
            expect(insights).toEqual(mockDocumentInsights);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/insights/`
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockDocumentInsights);
      });
    });
  });

  describe('analyzeDocument', () => {
    it('should trigger document analysis', async () => {
      await new Promise<void>((resolve) => {
        service.analyzeDocument(companyId, mockDocument.id).subscribe({
          next: (insights) => {
            expect(insights).toEqual(mockDocumentInsights);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/analyze/`
        );
        expect(req.request.method).toBe('POST');
        req.flush(mockDocumentInsights);
      });
    });
  });

  describe('addSigner', () => {
    it('should add signer to document', async () => {
      const signerData = { name: 'Jane Doe', email: 'jane@example.com' };

      await new Promise<void>((resolve) => {
        service.addSigner(companyId, mockDocument.id, signerData).subscribe({
          next: (signer) => {
            expect(signer).toBeTruthy();
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/add_signer/`
        );
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(signerData);
        req.flush({ token: 'signer-token', sign_url: 'https://example.com/sign' });
      });
    });
  });

  describe('cancelDocument', () => {
    it('should cancel document', async () => {
      await new Promise<void>((resolve) => {
        service.cancelDocument(companyId, mockDocument.id).subscribe({
          next: (document) => {
            expect(document).toBeTruthy();
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/cancel/`
        );
        expect(req.request.method).toBe('POST');
        req.flush({ ...mockDocument, internal_status: 'cancelled' });
      });
    });
  });

  describe('refreshStatus', () => {
    it('should refresh document status', async () => {
      await new Promise<void>((resolve) => {
        service.refreshStatus(companyId, mockDocument.id).subscribe({
          next: (document) => {
            expect(document).toEqual(mockDocument);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/${mockDocument.id}/refresh_status/`
        );
        expect(req.request.method).toBe('POST');
        req.flush(mockDocument);
      });
    });
  });

  describe('getMetrics', () => {
    it('should fetch document metrics', async () => {
      await new Promise<void>((resolve) => {
        service.getMetrics(companyId).subscribe({
          next: (metrics) => {
            expect(metrics).toEqual(mockDocumentMetrics);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/metrics/`
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockDocumentMetrics);
      });
    });
  });

  describe('getAlerts', () => {
    it('should fetch document alerts', async () => {
      const mockResponse: DocumentAlertsResponse = {
        alerts: mockDocumentAlerts,
        count: mockDocumentAlerts.length,
      };

      await new Promise<void>((resolve) => {
        service.getAlerts(companyId).subscribe({
          next: (response) => {
            expect(response).toEqual(mockResponse);
            resolve();
          },
        });

        const req = httpMock.expectOne(
          `${apiUrl}/companies/${companyId}/documents/alerts/`
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });
    });
  });
});

