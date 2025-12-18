import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company } from '../../shared/models/company.model';
import { PaginatedResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly apiUrl = environment.apiUrl;
  private readonly currentCompanySignal = signal<Company | null>(null);
  private loadingCompany$: Observable<Company | null> | null = null;

  currentCompany = this.currentCompanySignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadCompany(): Observable<Company> {
    return this.http
      .get<PaginatedResponse<Company>>(`${this.apiUrl}/companies/`)
      .pipe(
        map((response) => {
          if (response.results.length === 0) {
            throw new Error('Nenhuma empresa encontrada');
          }
          const company = response.results[0];
          this.currentCompanySignal.set(company);
          this.loadingCompany$ = null; // Limpar cache após carregar
          return company;
        })
      );
  }

  getCompanyId(): number {
    return this.currentCompanySignal()?.id ?? 0;
  }

  hasCompany(): boolean {
    return this.currentCompanySignal() !== null;
  }

  ensureCompanyLoaded(): Observable<Company | null> {
    // Se já tem company carregada, retorna imediatamente
    if (this.currentCompanySignal()) {
      return of(this.currentCompanySignal()!);
    }

    // Se já está carregando, retorna o mesmo Observable (shareReplay)
    if (this.loadingCompany$) {
      return this.loadingCompany$;
    }

    // Cria novo Observable e compartilha entre múltiplas subscriptions
    this.loadingCompany$ = this.loadCompany().pipe(
      map((company) => company),
      catchError(() => {
        this.loadingCompany$ = null; // Limpar cache em caso de erro
        return of(null);
      }),
      shareReplay(1) // Compartilha o resultado entre múltiplas subscriptions
    );

    return this.loadingCompany$;
  }
}
