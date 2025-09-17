import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * JWT Interceptor - Version cookie HTTPOnly
 *
 * Le backend lit le JWT depuis le cookie, donc
 * aucune gestion du token côté frontend.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private readonly PUBLIC_ENDPOINTS = [
    '/api/auth/login',
    '/api/auth/register'
  ];

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Les cookies sont envoyés automatiquement si { withCredentials: true } est utilisé dans les services
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Gestion d'erreurs simplifiée
   */
  private handleError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      // Redirection vers la page de login en cas d'erreur d'authentification
      this.router.navigate(['/auth/login']);
    }
    // Les autres erreurs sont gérées par les composants
  }
}
