// ============================================================================
// AUTH SERVICE - EXPORTS CORRIGÉS
// src/app/features/auth/auth.service.ts
// ============================================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
// ✅ Import depuis les interfaces existantes
import { 
  LoginRequest, 
  RegisterRequest, 
  JwtResponse, 
  MessageResponse, 
  User 
} from './interfaces/auth.interface';

/**
 * Service d'authentification simple pour MVP
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'mdd_token';
  private readonly USER_KEY = 'mdd_user';

  // États réactifs
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔐 AuthService initialisé');
  }

  // ===========================
  // MÉTHODES PRINCIPALES
  // ===========================

  register(request: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/register`, request)
      .pipe(
        tap(response => console.log('✅ Inscription réussie:', response.message)),
        catchError(this.handleError)
      );
  }

  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.API_URL}/login`, request)
      .pipe(
        tap(response => this.handleSuccessfulLogin(response)),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  // ===========================
  // MÉTHODES UTILITAIRES
  // ===========================

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  // Mise à jour des données utilisateur (appelée depuis ProfileService)
  updateCurrentUser(updatedUser: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
  }

  // ===========================
  // MÉTHODES PRIVÉES
  // ===========================

  private handleSuccessfulLogin(response: JwtResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email
    };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Une erreur inattendue s\'est produite';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur réseau: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 409:
          errorMessage = error.error?.message || 'Cet email est déjà utilisé';
          break;
        default:
          errorMessage = error.error?.message || errorMessage;
      }
    }

    console.error('❌ Erreur AuthService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  };
}

// ✅ Export des types pour utilisation dans les composants
export { 
  LoginRequest, 
  RegisterRequest, 
  JwtResponse, 
  MessageResponse, 
  User 
};