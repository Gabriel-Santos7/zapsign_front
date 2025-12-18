import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

export class MockHttpClient {
  private mockResponses: Map<string, any> = new Map();

  setResponse(url: string, response: any): void {
    this.mockResponses.set(url, response);
  }

  get(url: string, options?: any) {
    const response = this.mockResponses.get(url) || { data: null };
    return of(new HttpResponse({ status: 200, body: response }));
  }

  post(url: string, body: any, options?: any) {
    const response = this.mockResponses.get(url) || { data: body };
    return of(new HttpResponse({ status: 200, body: response }));
  }

  put(url: string, body: any, options?: any) {
    const response = this.mockResponses.get(url) || { data: body };
    return of(new HttpResponse({ status: 200, body: response }));
  }

  patch(url: string, body: any, options?: any) {
    const response = this.mockResponses.get(url) || { data: body };
    return of(new HttpResponse({ status: 200, body: response }));
  }

  delete(url: string, options?: any) {
    return of(new HttpResponse({ status: 200, body: null }));
  }

  request(method: string, url: string, options?: any) {
    const response = this.mockResponses.get(url) || { data: null };
    return of(new HttpResponse({ status: 200, body: response }));
  }
}

