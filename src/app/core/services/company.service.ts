import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company } from '../../shared/models/company.model';
import { PaginatedResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly apiUrl = environment.apiUrl;
  private readonly currentCompanySignal = signal<Company | null>(null);

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
          return company;
        })
      );
  }

  getCompanyId(): number {
    return this.currentCompanySignal()?.id ?? 0;
  }
}
