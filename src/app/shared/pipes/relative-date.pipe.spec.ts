import { RelativeDatePipe } from './relative-date.pipe';

describe('RelativeDatePipe', () => {
  let pipe: RelativeDatePipe;

  beforeEach(() => {
    pipe = new RelativeDatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    beforeEach(() => {
      // Mock Date.now() para ter controle sobre o tempo atual
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return empty string for null value', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should return empty string for undefined value', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should return "agora" for dates less than 60 seconds ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-01T11:59:30Z'); // 30 seconds ago
      expect(pipe.transform(date)).toBe('agora');
    });

    it('should return "há 1 minuto" for dates between 45 and 90 seconds ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-01T11:59:00Z'); // 1 minute ago
      expect(pipe.transform(date)).toBe('há 1 minuto');
    });

    it('should return "há X minutos" for dates less than 45 minutes ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-01T11:30:00Z'); // 30 minutes ago
      expect(pipe.transform(date)).toBe('há 30 minutos');
    });

    it('should return "há 1 hora" for dates between 45 and 90 minutes ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-01T11:00:00Z'); // 1 hour ago
      expect(pipe.transform(date)).toBe('há 1 hora');
    });

    it('should return "há X horas" for dates less than 24 hours ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-01T06:00:00Z'); // 6 hours ago
      expect(pipe.transform(date)).toBe('há 6 horas');
    });

    it('should return "há 1 dia" for dates between 24 and 48 hours ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2023-12-31T12:00:00Z'); // 1 day ago
      expect(pipe.transform(date)).toBe('há 1 dia');
    });

    it('should return "há X dias" for dates less than 30 days ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2023-12-20T12:00:00Z'); // 12 days ago
      expect(pipe.transform(date)).toBe('há 12 dias');
    });

    it('should return "há 1 mês" for dates between 30 and 60 days ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2023-12-01T12:00:00Z'); // ~31 days ago
      expect(pipe.transform(date)).toBe('há 1 mês');
    });

    it('should return "há X meses" for dates less than 12 months ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2023-06-01T12:00:00Z'); // ~7 months ago (214 days)
      expect(pipe.transform(date)).toBe('há 7 meses');
    });

    it('should return "há 1 ano" for dates between 12 and 24 months ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2023-01-01T12:00:00Z'); // 1 year ago
      expect(pipe.transform(date)).toBe('há 1 ano');
    });

    it('should return "há X anos" for dates more than 2 years ago', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const date = new Date('2020-01-01T12:00:00Z'); // 4 years ago
      expect(pipe.transform(date)).toBe('há 4 anos');
    });

    it('should accept string dates', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const dateString = '2024-01-01T11:00:00Z';
      expect(pipe.transform(dateString)).toBe('há 1 hora');
    });

    it('should handle future dates correctly', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);
      const futureDate = new Date('2024-01-01T13:00:00Z'); // 1 hour in the future
      // Pipe returns "agora" for negative differences (future dates)
      expect(pipe.transform(futureDate)).toBe('agora');
    });
  });
});

