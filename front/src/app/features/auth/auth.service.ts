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
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
    console.log('✅ Déconnexion - Token et userId supprimés');
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

  checkAuthStatus(): Observable<User> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.logout();
      return throwError(() => new Error('No token found'));
    }

    // Récupérer l'ID utilisateur depuis le localStorage
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      console.log('❌ Aucun userId trouvé dans localStorage');
      this.logout();
      return throwError(() => new Error('No user ID found'));
    }

    return this.http.get<any>(`/api/user/${userId}`).pipe(
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

  // =============================================================================
  // MÉTHODES PRIVÉES
  // =============================================================================

  private handleAuthSuccess(response: AuthResponse): void {
    console.log('🔍 handleAuthSuccess - response:', response);
    
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.id.toString()); // ✅ CORRIGÉ - utiliser response.id directement
    
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

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      this.checkAuthStatus().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  private handleError = (error: any): Observable<never> => {
    console.error('❌ AuthService Error:', error);
    return throwError(() => error);
  };
}