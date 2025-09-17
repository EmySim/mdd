import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '../../services/error.service';
import {
  Theme,
  ThemesPage,
  CreateThemeRequest,
  UpdateThemeRequest,
} from '../../interfaces/theme.interface';

/**
 * Interface pour les réponses de subscription/unsubscription
 */
export interface SubscriptionResponse {
  success: boolean;
  message: string;
  themeId: number;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly API_URL = '/api/subjects'; // Backend utilise encore "subjects"

  constructor(private http: HttpClient, private errorService: ErrorService) {}

  /**
   * Récupère tous les thèmes avec statut d'abonnement
   */
  getAllThemes(page = 0, size = 20): Observable<ThemesPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<ThemesPage>(this.API_URL, {
        params,
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère un thème par ID
   */
  getThemeById(id: number): Observable<Theme> {
    return this.http
      .get<Theme>(`${this.API_URL}/${id}`, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * S'abonner à un thème
   * @param id - ID du thème
   * @returns Réponse de subscription typée
   */
  subscribeToTheme(id: number): Observable<SubscriptionResponse> {
    return this.http
      .post<SubscriptionResponse>(
        `${this.API_URL}/${id}/subscribe`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Se désabonner d'un thème
   * @param id - ID du thème
   * @returns Réponse de désinscription typée
   */
  unsubscribeFromTheme(id: number): Observable<SubscriptionResponse> {
    return this.http
      .delete<SubscriptionResponse>(`${this.API_URL}/${id}/subscribe`, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Gestion d'erreurs centralisée
   * @param error - Erreur HTTP reçue
   * @returns Observable qui émet une erreur
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('ThemeService Error:', error);
    this.errorService.handleHttpError(error);
    return throwError(() => error);
  };
}
