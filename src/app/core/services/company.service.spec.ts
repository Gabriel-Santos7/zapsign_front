import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CompanyService } from './company.service';
import { Company } from '../../shared/models/company.model';
import { PaginatedResponse } from '../../shared/models/api-response.model';
import { environment } from '../../../environments/environment';
import { mockCompany } from '../../../tests/fixtures';

describe('CompanyService', () => {
  let service: CompanyService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    TestBed.overrideProvider(CompanyService, {
      useFactory: (http: HttpClient) => new CompanyService(http),
      deps: [HttpClient],
    });
    service = TestBed.inject(CompanyService);
    httpMock = TestBed.inject(HttpTestingController);
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

  describe('loadCompany', () => {
    it('should load company and update signal', async () => {
      const mockResponse: PaginatedResponse<Company> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockCompany],
      };

      let result: Company | undefined;
      service.loadCompany().subscribe({
        next: (company) => {
          result = company;
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/companies/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockCompany);
      expect(service.currentCompany()).toEqual(mockCompany);
      expect(service.getCompanyId()).toBe(mockCompany.id);
      expect(service.hasCompany()).toBe(true);
    });

    it('should throw error when no company is found', async () => {
      const mockResponse: PaginatedResponse<Company> = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      let error: Error | undefined;
      service.loadCompany().subscribe({
        error: (err) => {
          error = err;
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/companies/`);
      req.flush(mockResponse);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(error).toBeTruthy();
      expect(error?.message).toBe('Nenhuma empresa encontrada');
    });

    it('should handle HTTP errors', async () => {
      let error: any;
      service.loadCompany().subscribe({
        error: (err) => {
          error = err;
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/companies/`);
      req.error(new ErrorEvent('Network error'), { status: 500 });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(error).toBeTruthy();
    });
  });

  describe('getCompanyId', () => {
    it('should return 0 when no company is loaded', () => {
      expect(service.getCompanyId()).toBe(0);
    });

    it('should return company id when company is loaded', async () => {
      const mockResponse: PaginatedResponse<Company> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockCompany],
      };

      service.loadCompany().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/companies/`);
      req.flush(mockResponse);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(service.getCompanyId()).toBe(mockCompany.id);
    });
  });

  describe('hasCompany', () => {
    it('should return false when no company is loaded', () => {
      expect(service.hasCompany()).toBe(false);
    });

    it('should return true when company is loaded', async () => {
      const mockResponse: PaginatedResponse<Company> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockCompany],
      };

      service.loadCompany().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/companies/`);
      req.flush(mockResponse);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(service.hasCompany()).toBe(true);
    });
  });

  describe('ensureCompanyLoaded', () => {
    it('should return existing company immediately if already loaded', async () => {
      const mockResponse: PaginatedResponse<Company> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockCompany],
      };

      // First load the company
      service.loadCompany().subscribe();
      const req1 = httpMock.expectOne(`${apiUrl}/companies/`);
      req1.flush(mockResponse);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Now ensureCompanyLoaded should return immediately without making a new request
      let result: Company | null | undefined;
      service.ensureCompanyLoaded().subscribe({
        next: (company) => {
          result = company;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockCompany);
      httpMock.verify(); // Should not have any pending requests
    });

    it('should load company if not already loaded', async () => {
      const mockResponse: PaginatedResponse<Company> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockCompany],
      };

      let result: Company | null | undefined;
      service.ensureCompanyLoaded().subscribe({
        next: (company) => {
          result = company;
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/companies/`);
      req.flush(mockResponse);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toEqual(mockCompany);
    });

    it('should return null on error', async () => {
      let result: Company | null | undefined;
      service.ensureCompanyLoaded().subscribe({
        next: (company) => {
          result = company;
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/companies/`);
      req.error(new ErrorEvent('Network error'), { status: 500 });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result).toBeNull();
    });
  });
});

