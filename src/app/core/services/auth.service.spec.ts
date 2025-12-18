import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockSessionStorage: Record<string, string>;

  beforeEach(() => {
    // Mock sessionStorage
    mockSessionStorage = {};
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockSessionStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockSessionStorage[key];
        }),
        clear: vi.fn(() => {
          mockSessionStorage = {};
        }),
      },
      writable: true,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    mockSessionStorage = {};
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should load token from sessionStorage on initialization', () => {
      mockSessionStorage['auth_token'] = 'test-token-123';
      const newService = new AuthService();
      expect(newService.getToken()).toBe('test-token-123');
      expect(newService.isAuthenticated()).toBe(true);
    });

    it('should not load token if sessionStorage is empty', () => {
      const newService = new AuthService();
      expect(newService.getToken()).toBeNull();
      expect(newService.isAuthenticated()).toBe(false);
    });
  });

  describe('login', () => {
    it('should save token to sessionStorage and update signal', () => {
      service.login('new-token-456');
      expect(mockSessionStorage['auth_token']).toBe('new-token-456');
      expect(service.getToken()).toBe('new-token-456');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should update isAuthenticated computed signal when token is set', () => {
      expect(service.isAuthenticated()).toBe(false);
      service.login('test-token');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('should remove token from sessionStorage and clear signal', () => {
      service.login('test-token');
      expect(service.isAuthenticated()).toBe(true);

      service.logout();
      expect(mockSessionStorage['auth_token']).toBeUndefined();
      expect(service.getToken()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should handle logout when no token exists', () => {
      service.logout();
      expect(service.getToken()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return null when no token is set', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return the current token', () => {
      service.login('test-token-789');
      expect(service.getToken()).toBe('test-token-789');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is set', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when token is set', () => {
      service.login('test-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should update reactively when token changes', () => {
      expect(service.isAuthenticated()).toBe(false);
      service.login('test-token');
      expect(service.isAuthenticated()).toBe(true);
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});

