import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let guard: typeof authGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthService],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    guard = authGuard;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is authenticated', () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    const createUrlTreeSpy = vi.spyOn(router, 'createUrlTree');

    const result = TestBed.runInInjectionContext(() => {
      return guard({} as any, { url: '/dashboard' } as any);
    });

    expect(result).toBe(true);
    expect(createUrlTreeSpy).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
    const createUrlTreeSpy = vi.spyOn(router, 'createUrlTree').mockReturnValue({
      root: {} as any,
    } as UrlTree);

    const result = TestBed.runInInjectionContext(() => {
      return guard({} as any, { url: '/dashboard' } as any);
    });

    expect(result).toBeInstanceOf(Object);
    expect(createUrlTreeSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
  });

  it('should include returnUrl in query params when redirecting', () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
    const createUrlTreeSpy = vi.spyOn(router, 'createUrlTree').mockReturnValue({
      root: {} as any,
    } as UrlTree);

    TestBed.runInInjectionContext(() => {
      guard({} as any, { url: '/documents/123/edit' } as any);
    });

    expect(createUrlTreeSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/documents/123/edit' },
    });
  });
});

