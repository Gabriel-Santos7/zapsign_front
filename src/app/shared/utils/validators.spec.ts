import { FormControl } from '@angular/forms';
import { pdfUrlValidator, emailValidator } from './validators';

describe('Validators', () => {
  describe('pdfUrlValidator', () => {
    it('should return null for empty value (not required)', () => {
      const control = new FormControl('');
      const validator = pdfUrlValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      const validator = pdfUrlValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for valid PDF URL', () => {
      const control = new FormControl('https://example.com/document.pdf');
      const validator = pdfUrlValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return invalidUrl error for invalid URL format', () => {
      const control = new FormControl('not-a-valid-url');
      const validator = pdfUrlValidator();
      const result = validator(control);
      expect(result).toEqual({ invalidUrl: { value: 'not-a-valid-url' } });
    });

    it('should return invalidPdfExtension error for URL without .pdf extension', () => {
      const control = new FormControl('https://example.com/document.doc');
      const validator = pdfUrlValidator();
      const result = validator(control);
      expect(result).toEqual({ invalidPdfExtension: { value: 'https://example.com/document.doc' } });
    });

    it('should return invalidPdfExtension error for URL with .pdf in path but not at end', () => {
      const control = new FormControl('https://example.com/pdf/document.doc');
      const validator = pdfUrlValidator();
      const result = validator(control);
      expect(result).toEqual({ invalidPdfExtension: { value: 'https://example.com/pdf/document.doc' } });
    });

    it('should accept HTTP URLs', () => {
      const control = new FormControl('http://example.com/document.pdf');
      const validator = pdfUrlValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should accept HTTPS URLs', () => {
      const control = new FormControl('https://example.com/document.pdf');
      const validator = pdfUrlValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should accept URLs with query parameters', () => {
      const control = new FormControl('https://example.com/document.pdf?token=123');
      const validator = pdfUrlValidator();
      const result = validator(control);
      // URL with query params should still end with .pdf before the query string
      expect(result).toBeNull();
    });

    it('should accept URLs with fragments', () => {
      const control = new FormControl('https://example.com/document.pdf#page=1');
      const validator = pdfUrlValidator();
      const result = validator(control);
      // URL with fragment should still end with .pdf before the fragment
      expect(result).toBeNull();
    });

    it('should be case insensitive for .pdf extension', () => {
      const control = new FormControl('https://example.com/document.PDF');
      const validator = pdfUrlValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('emailValidator', () => {
    it('should return null for empty value (not required)', () => {
      const control = new FormControl('');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for valid email', () => {
      const control = new FormControl('test@example.com');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return invalidEmail error for email without @', () => {
      const control = new FormControl('testexample.com');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toEqual({ invalidEmail: { value: 'testexample.com' } });
    });

    it('should return invalidEmail error for email without domain', () => {
      const control = new FormControl('test@');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toEqual({ invalidEmail: { value: 'test@' } });
    });

    it('should return invalidEmail error for email without TLD', () => {
      const control = new FormControl('test@example');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toEqual({ invalidEmail: { value: 'test@example' } });
    });

    it('should accept emails with subdomains', () => {
      const control = new FormControl('test@mail.example.com');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should accept emails with plus signs', () => {
      const control = new FormControl('test+tag@example.com');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should accept emails with dots', () => {
      const control = new FormControl('test.user@example.com');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should accept emails with hyphens', () => {
      const control = new FormControl('test-user@example.com');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return invalidEmail error for email with spaces', () => {
      const control = new FormControl('test user@example.com');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toEqual({ invalidEmail: { value: 'test user@example.com' } });
    });

    it('should return invalidEmail error for email with invalid characters', () => {
      // Use an email without TLD (missing domain extension)
      const control = new FormControl('test@example');
      const validator = emailValidator();
      const result = validator(control);
      expect(result).toEqual({ invalidEmail: { value: 'test@example' } });
    });
  });
});

