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

  getAllArticles(
    page: number = 0, 
    size: number = 10, 
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Observable<ArticlesPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sortDirection); // ✅ CORRECTION: Juste la direction (le backend gère createdAt)

    return this.http.get<ArticlesPage>(this.API_URL, { params })
      .pipe(
        catchError(this.handleError),
        map(response => ({
          ...response,
          content: response.content || []
        }))
      );
  }

  getArticleById(id: number): Observable<ArticleDetail> {
    return this.http.get<ArticleDetail>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createArticle(article: CreateArticleRequest): Observable<Article> {
    return this.http.post<Article>(this.API_URL, article)
      .pipe(catchError(this.handleError));
  }

  private handleError = (error: any): Observable<never> => {
    console.error('ArticleService Error:', error);
    this.errorService.handleHttpError(error);
    return throwError(() => error);
  };
}