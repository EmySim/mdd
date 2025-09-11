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

  // =============================================================================
  // MÉTHODES PUBLIQUES
  // =============================================================================

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

  logout(): void {
    // Le backend doit gérer la suppression du cookie côté serveur si besoin
    this.currentUserSubject.next(null);
    this.router.navigate(['/landing']);
    console.log('✅ Déconnexion - Utilisateur déconnecté');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  checkAuthStatus(): Observable<User> {
    // On suppose que le backend lit le cookie JWT et renvoie le profil utilisateur
    return this.http.get<User>(
      `/api/user/profile`,
      { withCredentials: true }
    ).pipe(
      tap(userProfile => {
        console.log('✅ Profil utilisateur récupéré:', userProfile);
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
        console.log('❌ Échec vérification auth:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(
      `/api/user/${id}`,
      { withCredentials: true }
    ).pipe(
      tap(user => {
        console.log(`✅ Utilisateur ${id} récupéré:`, user);
      }),
      catchError(error => {
        console.log(`❌ Échec récupération utilisateur ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private handleAuthSuccess(response: AuthResponse): void {
    console.log('🔍 handleAuthSuccess - response:', response);

    // Le token est dans le cookie, pas besoin de le stocker côté client

    // Créer l'objet User à partir de la réponse
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    };

    this.currentUserSubject.next(user);
  }

  // ✅ rendu PUBLIC pour pouvoir être appelé depuis AppComponent
  public loadUserFromServer(): void {
    // Tente de charger le profil utilisateur si le cookie JWT est présent
    this.checkAuthStatus().subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.logout()
    });
  }

  private handleError = (error: unknown): Observable<never> => {
    console.error('❌ AuthService Error:', error);
    return throwError(() => error);
  };
}