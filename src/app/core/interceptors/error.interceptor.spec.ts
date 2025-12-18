import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
} from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MessageService } from 'primeng/api';
import { errorInterceptor } from './error.interceptor';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

describe('errorInterceptor', () => {
  let notificationService: NotificationService;
  let router: Router;
  let nextFn: HttpHandlerFn;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [NotificationService, MessageService],
    });
    notificationService = TestBed.inject(NotificationService);
    router = TestBed.inject(Router);
    nextFn = vi.fn() as HttpHandlerFn;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should pass through successful requests', async () => {
    const request = new HttpRequest('GET', '/api/test');
    const mockResponse = { status: 200 } as HttpEvent<any>;

    (nextFn as ReturnType<typeof vi.fn>).mockReturnValue(of(mockResponse));

    await new Promise<void>((resolve) => {
      TestBed.runInInjectionContext(() => {
        errorInterceptor(request, nextFn).subscribe({
          next: (response) => {
            expect(response).toEqual(mockResponse);
            resolve();
          },
        });
      });
    });
  });

  it('should handle 401 errors and redirect to login', async () => {
    const request = new HttpRequest('GET', '/api/test');
    const errorResponse = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
    });

    const showErrorSpy = vi.spyOn(notificationService, 'showError');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    (nextFn as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => errorResponse));

    await new Promise<void>((resolve) => {
      TestBed.runInInjectionContext(() => {
        errorInterceptor(request, nextFn).subscribe({
          error: (error) => {
            expect(error).toEqual(errorResponse);
            expect(showErrorSpy).toHaveBeenCalledWith('Sessão expirada. Faça login novamente.');
            expect(navigateSpy).toHaveBeenCalledWith(['/login']);
            resolve();
          },
        });
      });
    });
  });

  it('should handle 400 errors', async () => {
    const request = new HttpRequest('POST', '/api/test', null);
    const errorResponse = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: { message: 'Invalid data' },
    });

    const showErrorSpy = vi.spyOn(notificationService, 'showError');

    (nextFn as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => errorResponse));

    await new Promise<void>((resolve) => {
      TestBed.runInInjectionContext(() => {
        errorInterceptor(request, nextFn).subscribe({
          error: (error) => {
            expect(error).toEqual(errorResponse);
            expect(showErrorSpy).toHaveBeenCalledWith('Invalid data');
            resolve();
          },
        });
      });
    });
  });

  it('should handle 500 errors', async () => {
    const request = new HttpRequest('GET', '/api/test');
    const errorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: { detail: 'Server error occurred' },
    });

    const showErrorSpy = vi.spyOn(notificationService, 'showError');

    (nextFn as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => errorResponse));

    await new Promise<void>((resolve) => {
      TestBed.runInInjectionContext(() => {
        errorInterceptor(request, nextFn).subscribe({
          error: (error) => {
            expect(error).toEqual(errorResponse);
            expect(showErrorSpy).toHaveBeenCalledWith('Server error occurred');
            resolve();
          },
        });
      });
    });
  });

  it('should handle errors without detail message', async () => {
    const request = new HttpRequest('GET', '/api/test');
    const errorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
    });

    const showErrorSpy = vi.spyOn(notificationService, 'showError');

    (nextFn as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => errorResponse));

    await new Promise<void>((resolve) => {
      TestBed.runInInjectionContext(() => {
        errorInterceptor(request, nextFn).subscribe({
          error: (error) => {
            expect(error).toEqual(errorResponse);
            expect(showErrorSpy).toHaveBeenCalledWith('Erro na requisição');
            resolve();
          },
        });
      });
    });
  });
});

