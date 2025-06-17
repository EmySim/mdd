// src/app/features/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  LoginRequest, 
  RegisterRequest, 
  JwtResponse, 
  MessageResponse, 
  User 
} from './interfaces/auth.interface';

/**
 * Service d'authentification pour l'application MDD
 * 
 * Fonctionnalités :
 * - Inscription et connexion des utilisateurs
 * - Gestion des tokens JWT
 * - Stockage sécurisé des données utilisateur
 * - États réactifs (Observable) pour l'UI
 * - Gestion complète des erreurs
 * 
 * @author MDD Team
 * @version 1.0.0
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // ===========================
  // CONSTANTES DE CONFIGURATION
  // ===========================
  
  /** URL de base de l'API d'authentification */
  private readonly API_URL = '/api/auth';
  
  /** Clé de stockage du token JWT dans localStorage */
  private readonly TOKEN_KEY = 'mdd_token';
  
  /** Clé de stockage des données utilisateur dans localStorage */
  private readonly USER_KEY = 'mdd_user';

  // ===========================
  // SUJETS RÉACTIFS (OBSERVABLES)
  // ===========================
  
  /** Subject pour l'état de connexion - privé */
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  
  /** Subject pour l'utilisateur courant - privé */
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());

  /** Observable public pour l'état de connexion */
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  
  /** Observable public pour l'utilisateur courant */
  public currentUser$ = this.currentUserSubject.asObservable();

  // ===========================
  // CONSTRUCTEUR
  // ===========================
  
  /**
   * Constructeur du service d'authentification
   * 
   * @param http - Client HTTP Angular pour les requêtes API
   * @param router - Service de routing Angular pour les redirections
   */
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔐 AuthService initialisé');
    console.log('📊 État initial - Connecté:', this.isLoggedInSubject.value);
  }

  // ===========================
  // MÉTHODES D'AUTHENTIFICATION
  // ===========================

  /**
   * Inscription d'un nouvel utilisateur
   * 
   * @param request - Données d'inscription (email, username, password)
   * @returns Observable<MessageResponse> - Message de confirmation
   * 
   * @example
   * ```typescript
   * const registerData = { email: 'user@test.com', username: 'user', password: 'Password123!' };
   * this.authService.register(registerData).subscribe({
   *   next: (response) => console.log(response.message),
   *   error: (error) => console.error(error.message)
   * });
   * ```
   */
  register(request: RegisterRequest): Observable<MessageResponse> {
    console.log('📝 Tentative d\'inscription pour:', request.email);
    
    return this.http.post<MessageResponse>(`${this.API_URL}/register`, request)
      .pipe(
        tap(response => {
          console.log('✅ Inscription réussie:', response.message);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Connexion d'un utilisateur existant
   * 
   * @param request - Données de connexion (email/username + password)
   * @returns Observable<JwtResponse> - Token JWT et informations utilisateur
   * 
   * @example
   * ```typescript
   * const loginData = { email: 'user@test.com', password: 'Password123!' };
   * this.authService.login(loginData).subscribe({
   *   next: (response) => {
   *     // Utilisateur connecté automatiquement
   *     console.log('Connecté en tant que:', response.username);
   *   },
   *   error: (error) => console.error('Erreur de connexion:', error.message)
   * });
   * ```
   */
  login(request: LoginRequest): Observable<JwtResponse> {
    console.log('🔑 Tentative de connexion pour:', request.email);
    
    return this.http.post<JwtResponse>(`${this.API_URL}/login`, request)
      .pipe(
        tap(response => {
          this.handleSuccessfulLogin(response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Déconnexion de l'utilisateur courant
   * 
   * Actions effectuées :
   * - Suppression du token JWT du localStorage
   * - Suppression des données utilisateur du localStorage
   * - Mise à jour des états réactifs (isLoggedIn$ et currentUser$)
   * - Redirection vers la page d'accueil
   * 
   * @param redirectToLanding - Si true, redirige vers /landing, sinon vers /
   * 
   * @example
   * ```typescript
   * // Déconnexion standard
   * this.authService.logout();
   * 
   * // Déconnexion avec redirection spécifique
   * this.authService.logout(true); // Vers /landing
   * ```
   */
  logout(redirectToLanding: boolean = false): void {
    console.log('🚪 Déconnexion en cours...');
    
    // Nettoyage du stockage local
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Mise à jour des états réactifs
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    
    console.log('✅ Déconnexion effectuée - Stockage nettoyé');
    
    // Redirection selon le paramètre
    const redirectPath = redirectToLanding ? '/landing' : '/';
    console.log(`🔄 Redirection vers: ${redirectPath}`);
    this.router.navigate([redirectPath]);
  }

  // ===========================
  // MÉTHODES DE VÉRIFICATION D'ÉTAT
  // ===========================

  /**
   * Récupère le token JWT stocké
   * 
   * @returns string | null - Le token JWT ou null si absent
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Vérifie si un token JWT valide est présent
   * 
   * Validation :
   * - Présence du token
   * - Structure JWT correcte
   * - Token non expiré
   * 
   * @returns boolean - true si le token est valide, false sinon
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('🔍 Aucun token trouvé');
      return false;
    }

    try {
      // Décodage du payload JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > now;
      
      if (!isValid) {
        console.warn('⚠️ Token expiré');
        // Nettoyage automatique du token expiré
        this.logout();
      }
      
      return isValid;
    } catch (error) {
      console.warn('⚠️ Token JWT invalide:', error);
      // Nettoyage automatique du token corrompu
      this.logout();
      return false;
    }
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * 
   * @returns User | null - Les données utilisateur ou null si non connecté
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * 
   * @returns boolean - true si connecté, false sinon
   * 
   * @note Méthode synchrone alternative à isLoggedIn$ (Observable)
   */
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * Alias de isLoggedIn() pour compatibilité
   * 
   * @returns boolean - true si authentifié, false sinon
   */
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // ===========================
  // MÉTHODES PRIVÉES (UTILITAIRES)
  // ===========================

  /**
   * Gère une connexion réussie
   * 
   * Actions :
   * - Stockage du token JWT
   * - Stockage des données utilisateur
   * - Mise à jour des états réactifs
   * 
   * @private
   * @param response - Réponse de l'API de connexion
   */
  private handleSuccessfulLogin(response: JwtResponse): void {
    console.log('🎉 Traitement de la connexion réussie');
    
    // Stockage du token
    localStorage.setItem(this.TOKEN_KEY, response.token);
    
    // Construction de l'objet utilisateur
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email
    };
    
    // Stockage des données utilisateur
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Mise à jour des états réactifs
    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next(user);
    
    console.log('✅ Connexion réussie pour:', user.username);
    console.log('📊 Nouvel état - Connecté:', true);
  }

  /**
   * Récupère les données utilisateur depuis le localStorage
   * 
   * @private
   * @returns User | null - Données utilisateur ou null si absentes/corrompues
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) {
      console.log('🔍 Aucune donnée utilisateur trouvée');
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      console.log('📊 Utilisateur récupéré du stockage:', user.username);
      return user;
    } catch (error) {
      console.warn('⚠️ Données utilisateur corrompues:', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  /**
   * Gestionnaire d'erreurs HTTP centralisé
   * 
   * Traite les erreurs selon leur code de statut et fournit
   * des messages utilisateur appropriés
   * 
   * @private
   * @param error - Erreur HTTP reçue
   * @returns Observable<never> - Observable d'erreur avec message formaté
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Une erreur inattendue s\'est produite';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client/réseau
      errorMessage = `Erreur réseau: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Données invalides';
          break;
        case 401:
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 409:
          errorMessage = error.error?.message || 'Cet email est déjà utilisé';
          break;
        case 422:
          errorMessage = error.error?.message || 'Données de validation incorrectes';
          break;
        case 500:
          errorMessage = 'Erreur serveur temporaire, veuillez réessayer';
          break;
        case 503:
          errorMessage = 'Service temporairement indisponible';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('❌ Erreur AuthService:', {
      status: error.status,
      message: errorMessage,
      url: error.url
    });

    return throwError(() => new Error(errorMessage));
  };
}

// Export des types pour faciliter l'import
export { LoginRequest, RegisterRequest, JwtResponse, MessageResponse, User };