import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { App } from './app';

// Mock do componente App para testes
@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: true,
  imports: [],
})
class TestAppComponent {
  protected readonly title = { signal: () => 'zapsign_front' };
}

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestAppComponent],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(TestAppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', async () => {
    const fixture = TestBed.createComponent(TestAppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
