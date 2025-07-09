import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'authToken';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  
  public readonly isLoggedIn$ = this.currentUser$.pipe(
    map(user => user !== null)
  );

  constructor(
    private http: HttpClient,
    private router: Router
    // 🎯 SOLUTION : Pas d'injection ErrorService pour éviter les cycles
  ) {
    this.loadUserFromStorage();
  }

  // =============================================================================
  // MÉTHODES PUBLIQUES
  // =============================================================================

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  // Méthodes synchrones pour la compatibilité
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.currentUserSubject.next(response.user);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      this.getCurrentUserFromAPI().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  private getCurrentUserFromAPI(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * 🎯 SOLUTION : Gestion d'erreurs simplifiée
   * Les composants gèrent leurs propres erreurs via ErrorService
   */
  private handleError = (error: any): Observable<never> => {
    console.error('❌ AuthService Error:', error);
    
    // Simple re-throw : les composants gèrent l'affichage
    return throwError(() => error);
  };
}