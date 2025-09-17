// article.service.ts - Service pour la gestion des articles
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ErrorService } from '../../services/error.service';
import { 
  Article, 
  ArticlesPage, 
  CreateArticleRequest, 
  UpdateArticleRequest,
  ArticleDetail 
} from '../../interfaces/article.interface';

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
   * Récupère la liste paginée des articles
   */
  getAllArticles(
    page: number = 0, 
    size: number = 10, 
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Observable<ArticlesPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sortDirection);

    return this.http.get<ArticlesPage>(this.API_URL, { 
        params, 
        withCredentials: true
      })
      .pipe(
        catchError(this.handleError),
        map(response => ({
          ...response,
          content: response.content || []
        }))
      );
  }

  /**
   * Récupère un article par son ID
   */
  getArticleById(id: number): Observable<ArticleDetail> {
    return this.http.get<ArticleDetail>(`${this.API_URL}/${id}`, { 
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Crée un nouvel article
   */
  createArticle(article: CreateArticleRequest): Observable<Article> {
    return this.http.post<Article>(this.API_URL, article, { 
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Met à jour un article existant
   */
  updateArticle(id: number, article: UpdateArticleRequest): Observable<Article> {
    return this.http.put<Article>(`${this.API_URL}/${id}`, article, { 
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Supprime un article par son ID
   */
  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, { 
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError = (error: any): Observable<never> => {
    this.errorService.handleHttpError(error);
    return throwError(() => error);
  };
}
