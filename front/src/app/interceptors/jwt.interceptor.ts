// src/app/core/interceptors/jwt.interceptor.ts - VERSION MVP
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { AuthService } from '../features/auth/auth.service';
import { ErrorService } from '../services/error.service';

/**
 * Intercepteur JWT MVP - Simple et efficace
 * 
 * Fonctionnalités :
 * ✅ Ajoute token JWT automatiquement
 * ✅ Gère les erreurs HTTP avec ErrorService
 * ✅ Déconnexion automatique sur 401
 * ❌ Pas de retry automatique (MVP)
 * ❌ Pas de gestion complexe (MVP)
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private readonly PUBLIC_ENDPOINTS = [
    '/api/auth/login',
    '/api/auth/register'
  ];

  constructor(
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // Ajouter token si nécessaire
    const authenticatedRequest = this.addTokenIfNeeded(request);

    // Exécuter avec gestion d'erreurs
    return next.handle(authenticatedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Ajoute le token aux requêtes API privées
   */
  private addTokenIfNeeded(request: HttpRequest<unknown>): HttpRequest<unknown> {
    const needsToken = request.url.includes('/api/') && 
                      !this.PUBLIC_ENDPOINTS.some(endpoint => request.url.includes(endpoint));

    if (needsToken) {
      const token = this.authService.getToken();
      if (token) {
        console.log(`🔐 Token ajouté pour: ${request.method} ${request.url}`);
        return request.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }
    }

    return request;
  }

  /**
   * Gestion simple des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): void {
    console.error(`❌ HTTP ${error.status} sur ${error.url}:`, error);

    if (error.status === 401) {
      // Token expiré - déconnexion automatique
      console.warn('🚫 Token expiré - déconnexion automatique');
      this.authService.logout();
    } else {
      // Autres erreurs - délégation au ErrorService
      this.errorService.handleHttpError(error);
    }
  }
}