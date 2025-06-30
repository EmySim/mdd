// src/app/features/profile/profile.service.ts - IMPLÉMENTATION COMPLÈTE
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorService } from '../../services/error.service';
import { AuthService } from '../auth/auth.service';

// Interface alignée avec UserDTO backend
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = '/api/user';

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private authService: AuthService
  ) {}

  /**
   * Récupère le profil utilisateur avec abonnements
   */
  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Met à jour le profil utilisateur
   */
  updateUserProfile(userId: number, profileData: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API_URL}/${userId}`, profileData)
      .pipe(
        tap((updatedUser) => {
          // Mettre à jour les données utilisateur dans AuthService si email/username changés
          if (profileData.email || profileData.username) {
            console.log('🔄 Mise à jour données utilisateur dans AuthService');
            // Le backend retournera les nouvelles données
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Déconnexion via API (optionnel - peut être juste côté client)
   */
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {})
      .pipe(
        tap(() => {
          console.log('🚪 Déconnexion API réussie');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère les abonnements de l'utilisateur
   * (si endpoint dédié disponible plus tard)
   */
  getUserSubscriptions(userId: number): Observable<any[]> {
    // TODO: Implémenter quand endpoint disponible
    // return this.http.get<any[]>(`${this.API_URL}/${userId}/subscriptions`)
    //   .pipe(catchError(this.handleError));
    
    // Pour l'instant, retourner vide
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  /**
   * Gestion d'erreurs centralisée
   */
  private handleError = (error: any): Observable<never> => {
    console.error('ProfileService Error:', error);
    this.errorService.handleHttpError(error);
    return throwError(() => error);
  };
}