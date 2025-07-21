import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorService } from '../../services/error.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../../interfaces/user.interface';
import { UpdateUserRequest } from '../../interfaces/user.interface';

/**
 * Service simple pour la gestion du profil utilisateur
 */
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

  // ===========================
  // MÉTHODES PRINCIPALES
  // ===========================

  /**
   * Récupère le profil utilisateur
   */
  getUserProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${userId}`)
      .pipe(
        tap((user: User) => console.log('✅ Profil récupéré:', user.username)),
        catchError(this.handleError)
      );
  }

  /**
   * Met à jour le profil utilisateur
   */
  updateUserProfile(userId: number, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${userId}`, userData)
      .pipe(
        tap((updatedUser: User) => {
          console.log('✅ Profil mis à jour:', updatedUser.username);
          
          // Mettre à jour les données dans AuthService
          this.authService.updateCurrentUser(updatedUser);
        }),
        catchError(this.handleError)
      );
  }

  // ===========================
  // GESTION D'ERREURS
  // ===========================

  /**
   * Gestionnaire d'erreur HTTP typé
   * @param error - Erreur HTTP reçue
   * @returns Observable qui émet une erreur
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('❌ Erreur ProfileService:', error);
    this.errorService.handleHttpError(error);
    return throwError(() => error);
  };
}