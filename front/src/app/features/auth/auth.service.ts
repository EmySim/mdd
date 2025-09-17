// auth.service.ts - Service d'authentification centralisé
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

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  public readonly isLoggedIn$ = this.currentUser$.pipe(
    map(user => user !== null)
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromServer();
  }

  // ============================================================================
  // MÉTHODES PUBLIQUES
  // ============================================================================

  /**
   * Connexion utilisateur.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API_URL}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Inscription utilisateur.
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API_URL}/register`,
      userData,
      { withCredentials: true }
    ).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Déconnexion utilisateur.
   * Réinitialise l'état local et redirige vers la landing page.
   */
  logout(): void {
    this.currentUserSubject.next(null);
    this.router.navigate(['/landing']);
  }

  /**
   * Retourne l'utilisateur courant (synchrone).
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Met à jour manuellement l'utilisateur courant.
   */
  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Vérifie si l'utilisateur est connecté (synchrone).
   */
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Vérifie l'état d'authentification auprès du serveur.
   * Si valide → met à jour le user, sinon → logout.
   */
  checkAuthStatus(): Observable<User> {
    return this.http.get<User>(
      `/api/user/profile`,
      { withCredentials: true }
    ).pipe(
      tap(userProfile => {
        const user: User = {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt
        };
        this.updateCurrentUser(user);
      }),
      map(userProfile => ({
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt
      })),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère un utilisateur par son id.
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(
      `/api/user/${id}`,
      { withCredentials: true }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Chargement initial du profil utilisateur si un cookie JWT est présent.
   */
  public loadUserFromServer(): void {
    this.checkAuthStatus().subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.logout()
    });
  }

  // ============================================================================
  // MÉTHODES PRIVÉES
  // ============================================================================

  private handleAuthSuccess(response: AuthResponse): void {
    // ⚠️ Token géré par HttpOnly cookie côté serveur → rien à stocker ici
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    };
    this.currentUserSubject.next(user);
  }

  private handleError = (error: unknown): Observable<never> => {
    return throwError(() => error);
  };
}
