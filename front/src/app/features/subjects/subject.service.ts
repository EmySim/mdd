// src/app/features/themes/subject.service.ts - RENOMMÉ ET ALIGNÉ
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '../../services/error.service';

// Interface alignée avec SubjectDTO backend  
export interface Subject {
  id: number;
  name: string;
  createdAt: string;
  isSubscribed: boolean;
}

export interface SubjectsPage {
  content: Subject[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private readonly API_URL = '/api/subjects';

  constructor(
    private http: HttpClient,
    private errorService: ErrorService
  ) {}

  /**
   * Récupère tous les sujets avec statut d'abonnement
   */
  getAllSubjects(page = 0, size = 20): Observable<SubjectsPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<SubjectsPage>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère un sujet par ID
   */
  getSubjectById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * S'abonner à un sujet
   */
  subscribeToSubject(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/subscribe`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Se désabonner d'un sujet
   */
  unsubscribeFromSubject(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}/subscribe`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gestion d'erreurs centralisée
   */
  private handleError = (error: any): Observable<never> => {
    console.error('SubjectService Error:', error);
    this.errorService.handleHttpError(error);
    return throwError(() => error);
  };
}