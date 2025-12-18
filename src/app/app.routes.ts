import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes
          ),
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('./features/documents/documents.routes').then(
            (m) => m.documentsRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
