import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpEvent, HttpHandlerFn, HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let nextFn: HttpHandlerFn;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    nextFn = vi.fn((req: HttpRequest<unknown>) => of({} as HttpEvent<unknown>)) as HttpHandlerFn;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token exists', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue('test-token-123');

    const request = new HttpRequest('GET', '/api/test');
    TestBed.runInInjectionContext(() => {
      authInterceptor(request, nextFn).subscribe();
    });

    expect(nextFn).toHaveBeenCalled();
    const interceptedReq = (nextFn as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(interceptedReq.headers.get('Authorization')).toBe('Token test-token-123');
  });

  it('should not add Authorization header when token is null', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue(null);

    const request = new HttpRequest('GET', '/api/test');
    TestBed.runInInjectionContext(() => {
      authInterceptor(request, nextFn).subscribe();
    });

    expect(nextFn).toHaveBeenCalled();
    const interceptedReq = (nextFn as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(interceptedReq.headers.has('Authorization')).toBe(false);
  });

  it('should preserve existing headers', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue('test-token-123');

    const request = new HttpRequest('GET', '/api/test', null, {
      headers: new HttpHeaders({ 'Custom-Header': 'custom-value' }),
    });
    TestBed.runInInjectionContext(() => {
      authInterceptor(request, nextFn).subscribe();
    });

    const interceptedReq = (nextFn as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(interceptedReq.headers.get('Custom-Header')).toBe('custom-value');
    expect(interceptedReq.headers.get('Authorization')).toBe('Token test-token-123');
  });

  it('should handle requests without existing headers', () => {
    vi.spyOn(authService, 'getToken').mockReturnValue('test-token-123');

    const request = new HttpRequest('GET', '/api/test');
    TestBed.runInInjectionContext(() => {
      authInterceptor(request, nextFn).subscribe();
    });

    const interceptedReq = (nextFn as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(interceptedReq.headers.get('Authorization')).toBe('Token test-token-123');
  });
});

