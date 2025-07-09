import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * JWT Interceptor MVP - SANS dépendance circulaire
 * 
 * 🎯 SOLUTION : Accès direct au localStorage au lieu d'injecter AuthService
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private readonly TOKEN_KEY = 'authToken';
  private readonly PUBLIC_ENDPOINTS = [
    '/api/auth/login',
    '/api/auth/register'
  ];

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // 🎯 SOLUTION : Ajouter token sans injecter AuthService
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
   * 🎯 SOLUTION : Accès direct au localStorage
   */
  private addTokenIfNeeded(request: HttpRequest<unknown>): HttpRequest<unknown> {
    const needsToken = request.url.includes('/api/') && 
                      !this.PUBLIC_ENDPOINTS.some(endpoint => request.url.includes(endpoint));

    if (needsToken) {
      // ✅ Accès direct au localStorage (pas d'injection AuthService)
      const token = localStorage.getItem(this.TOKEN_KEY);
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
   * 🎯 SOLUTION : Gestion d'erreurs simplifiée
   */
  private handleError(error: HttpErrorResponse): void {
    console.error(`❌ HTTP ${error.status} sur ${error.url}:`, error);

    if (error.status === 401) {
      // Token expiré - nettoyage et redirection
      console.warn('🚫 Token expiré - déconnexion automatique');
      
      // ✅ Nettoyage direct du localStorage
      localStorage.removeItem(this.TOKEN_KEY);
      
      // ✅ Redirection sans injecter AuthService
      this.router.navigate(['/auth/login']);
    }
    
    // Pour les autres erreurs, on laisse le composant les gérer
    // (pas d'injection ErrorService pour éviter les cycles)
  }
}