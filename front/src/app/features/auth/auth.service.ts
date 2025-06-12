// front/src/app/features/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Interfaces pour les DTOs d'authentification
 * Ces interfaces correspondent aux DTOs côté backend
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  expiresIn: number;
}

export interface MessageResponse {
  message: string;
  type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

/**
 * Service d'authentification centralisé pour l'application MDD
 * 
 * CONCEPTS TECHNIQUES CLÉS :
 * - BehaviorSubject : Observable qui garde la dernière valeur émise
 * - JWT : JSON Web Token pour l'authentification stateless
 * - LocalStorage : Stockage persistant côté client
 * - RxJS : Programmation réactive pour la gestion d'état
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'mdd_token';
  private readonly USER_KEY = 'mdd_user';

  /**
   * BehaviorSubject pour l'état de connexion
   * POURQUOI BehaviorSubject ? 
   * - Garde la dernière valeur émise (état actuel)
   * - Émet immédiatement la valeur courante aux nouveaux abonnés
   * - Permet une gestion d'état réactive dans toute l'app
   */
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());

  /**
   * Observables publics pour les composants
   * Les composants s'abonnent à ces observables pour réagir aux changements d'état
   */
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   * 
   * FLOW TECHNIQUE :
   * 1. Envoi requête POST vers /api/auth/register
   * 2. Backend valide les données (Bean Validation)
   * 3. Backend hash le mot de passe (BCrypt)
   * 4. Backend sauvegarde en base MySQL
   * 5. Retour MessageResponse de succès/erreur
   */
  register(request: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/register`, request)
      .pipe(
        tap(response => {
          console.log('✅ Inscription réussie:', response.message);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Connexion utilisateur avec JWT
   * 
   * FLOW TECHNIQUE :
   * 1. Envoi email/password vers /api/auth/login
   * 2. Backend authentifie via Spring Security
   * 3. Backend génère token JWT signé (durée: 24h)
   * 4. Frontend stocke token + infos user
   * 5. Mise à jour de l'état de connexion
   */
  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.API_URL}/login`, request)
      .pipe(
        tap(response => {
          this.handleSuccessfulLogin(response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Déconnexion utilisateur
   * 
   * ACTIONS :
   * - Suppression du token et données user
   * - Mise à jour des BehaviorSubjects
   * - Redirection vers page d'accueil
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    
    console.log('🚪 Déconnexion effectuée');
    this.router.navigate(['/']);
  }

  /**
   * Récupération du token JWT stocké
   * Utilisé par l'intercepteur HTTP pour les requêtes authentifiées
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Vérification de validité du token
   * LOGIQUE :
   * - Existence du token
   * - Token non expiré (côté client)
   * - Format JWT valide
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Décodage du payload JWT (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      // Vérification expiration
      return payload.exp > now;
    } catch (error) {
      console.warn('⚠️ Token JWT invalide:', error);
      return false;
    }
  }

  /**
   * Accesseur pour l'utilisateur actuel
   * Retourne directement la valeur du BehaviorSubject
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérification du statut de connexion
   * Utilisé par les guards et composants
   */
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * Gestion des connexions réussies
   * ACTIONS :
   * - Stockage sécurisé du token
   * - Sauvegarde des infos utilisateur
   * - Mise à jour de l'état global
   */
  private handleSuccessfulLogin(response: JwtResponse): void {
    // Stockage du token JWT
    localStorage.setItem(this.TOKEN_KEY, response.token);
    
    // Création objet utilisateur
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email
    };
    
    // Stockage des infos utilisateur
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Mise à jour de l'état réactif
    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next(user);
    
    console.log('✅ Connexion réussie:', user.username);
    console.log('🔑 Token expire dans:', response.expiresIn, 'secondes');
  }

  /**
   * Récupération utilisateur depuis localStorage
   * Utilisé à l'initialisation du service
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.warn('⚠️ Données utilisateur corrompues:', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  /**
   * Gestionnaire d'erreurs centralisé
   * TYPES D'ERREURS :
   * - 400 : Validation échouée
   * - 401 : Authentification échouée  
   * - 409 : Conflit (email déjà utilisé)
   * - 500 : Erreur serveur
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
          errorMessage = error.error?.message || 'Conflit de données';
          break;
        case 500:
          errorMessage = 'Erreur serveur temporaire';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('❌ Erreur AuthService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  };
}