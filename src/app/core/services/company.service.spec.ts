import { TestBed } from '@angular/core/testing';
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

      await new Promise<void>((resolve) => {
        service.loadCompany().subscribe({
          next: (company) => {
            expect(company).toEqual(mockCompany);
            expect(service.currentCompany()).toEqual(mockCompany);
            expect(service.getCompanyId()).toBe(mockCompany.id);
            expect(service.hasCompany()).toBe(true);
            resolve();
          },
        });

        const req = httpMock.expectOne(`${apiUrl}/companies/`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });
    });

    it('should throw error when no company is found', async () => {
      const mockResponse: PaginatedResponse<Company> = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      await new Promise<void>((resolve) => {
        service.loadCompany().subscribe({
          error: (error) => {
            expect(error.message).toBe('Nenhuma empresa encontrada');
            resolve();
          },
        });

        const req = httpMock.expectOne(`${apiUrl}/companies/`);
        req.flush(mockResponse);
      });
    });

    it('should handle HTTP errors', async () => {
      await new Promise<void>((resolve) => {
        service.loadCompany().subscribe({
          error: (error) => {
            expect(error).toBeTruthy();
            resolve();
          },
        });

        const req = httpMock.expectOne(`${apiUrl}/companies/`);
        req.error(new ErrorEvent('Network error'), { status: 500 });
      });
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

      await new Promise<void>((resolve) => {
        service.loadCompany().subscribe({
          next: () => {
            expect(service.getCompanyId()).toBe(mockCompany.id);
            resolve();
          },
        });

        const req = httpMock.expectOne(`${apiUrl}/companies/`);
        req.flush(mockResponse);
      });
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

      await new Promise<void>((resolve) => {
        service.loadCompany().subscribe({
          next: () => {
            expect(service.hasCompany()).toBe(true);
            resolve();
          },
        });

        const req = httpMock.expectOne(`${apiUrl}/companies/`);
        req.flush(mockResponse);
      });
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

      await new Promise<void>((resolve) => {
        service.loadCompany().subscribe({
          next: () => {
            // Now ensureCompanyLoaded should return immediately
            service.ensureCompanyLoaded().subscribe({
              next: (company) => {
                expect(company).toEqual(mockCompany);
                resolve();
              },
            });
          },
        });

        const req = httpMock.expectOne(`${apiUrl}/companies/`);
        req.flush(mockResponse);
      });
    });

    it('should load company if not already loaded', async () => {
      const mockResponse: PaginatedResponse<Company> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockCompany],
      };

      await new Promise<void>((resolve) => {
        service.ensureCompanyLoaded().subscribe({
          next: (company) => {
            expect(company).toEqual(mockCompany);
            resolve();
          },
        });

        const req = httpMock.expectOne(`${apiUrl}/companies/`);
        req.flush(mockResponse);
      });
    });

    it('should return null on error', async () => {
      await new Promise<void>((resolve) => {
        service.ensureCompanyLoaded().subscribe({
          next: (company) => {
            expect(company).toBeNull();
            resolve();
          },
        });

        const req = httpMock.expectOne(`${apiUrl}/companies/`);
        req.error(new ErrorEvent('Network error'), { status: 500 });
      });
    });
  });
});

