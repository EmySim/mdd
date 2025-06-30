// src/app/features/articles/article.service.ts - IMPLÉMENTATION COMPLÈTE
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ErrorService } from '../../services/error.service';

// Interfaces alignées avec le backend
export interface Article {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorUsername: string;
  subjectId: number;
  subjectName: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  subjectId: number;
}

export interface ArticlesPage {
  content: Article[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;        
  first: boolean;       
  empty: boolean;    
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly API_URL = '/api/articles';

  constructor(
    private http: HttpClient,
    private errorService: ErrorService
  ) {}

  /**
   * Récupère le fil d'actualité personnalisé
   */
  getPersonalizedFeed(page = 0, size = 20): Observable<ArticlesPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ArticlesPage>(`${this.API_URL}/feed`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère tous les articles avec pagination
   */
  getAllArticles(page = 0, size = 20, sort = 'desc'): Observable<ArticlesPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ArticlesPage>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère un article par ID
   */
  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère les articles d'un sujet
   */
  getArticlesBySubject(subjectId: number, page = 0, size = 20): Observable<ArticlesPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ArticlesPage>(`${this.API_URL}/subject/${subjectId}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Crée un nouvel article
   */
  createArticle(articleData: CreateArticleRequest): Observable<Article> {
    return this.http.post<Article>(this.API_URL, articleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gestion d'erreurs centralisée
   */
  private handleError = (error: any): Observable<never> => {
    console.error('ArticleService Error:', error);
    this.errorService.handleHttpError(error);
    return throwError(() => error);
  };
}