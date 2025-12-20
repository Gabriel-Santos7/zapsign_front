import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log detalhado do erro para debug
      console.error('HTTP Error:', {
        url: req.url,
        status: error.status,
        statusText: error.statusText,
        error: error.error,
        headers: error.headers
      });

      if (error.status === 401) {
        router.navigate(['/login']);
        notificationService.showError('Sessão expirada. Faça login novamente.');
      } else if (error.status === 404) {
        // 404 é um estado esperado em alguns casos (ex: análise não disponível)
        // Não mostrar toast para 404 - deixar o componente tratar
        // Apenas logar para debug
        console.log('Resource not found (404):', req.url);
      } else if (error.status >= 400) {
        const errorMessage =
          error.error?.error ||
          error.error?.message ||
          error.error?.detail ||
          'Erro na requisição';
        notificationService.showError(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
