import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const documentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/document-list/document-list.component').then(
        (m) => m.DocumentListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/document-create/document-create.component').then(
        (m) => m.DocumentCreateComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/document-detail/document-detail.component').then(
        (m) => m.DocumentDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/document-edit/document-edit.component').then(
        (m) => m.DocumentEditComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: ':id/insights',
    loadComponent: () =>
      import('./components/document-insights/document-insights.component').then(
        (m) => m.DocumentInsightsComponent
      ),
    canActivate: [authGuard],
  },
];

