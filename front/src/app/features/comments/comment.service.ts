// src/app/features/comments/comment.service.ts - 
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '../../services/error.service';

// Interfaces alignées avec le backend
export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  authorId: number;
  authorUsername: string;
  articleId: number;
  articleTitle: string;
}

export interface CreateCommentRequest {
  content: string;
  // articleId sera dans l'URL, pas dans le body
}

export interface CommentsPage {
  content: Comment[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly API_URL = '/api';

  constructor(
    private http: HttpClient,
    private errorService: ErrorService
  ) {}

  /**
   * Récupère les commentaires d'un article
   */
  getCommentsByArticle(articleId: number, page = 0, size = 20): Observable<CommentsPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<CommentsPage>(`${this.API_URL}/articles/${articleId}/comments`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Crée un nouveau commentaire sur un article
   */
  createComment(articleId: number, commentData: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.API_URL}/articles/${articleId}/comments`, commentData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère un commentaire par ID
   */
  getCommentById(id: number): Observable<Comment> {
    return this.http.get<Comment>(`${this.API_URL}/comments/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Supprime un commentaire (si propriétaire)
   */
  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/comments/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gestion d'erreurs centralisée
   */
  private handleError = (error: any): Observable<never> => {
    console.error('CommentService Error:', error);
    this.errorService.handleHttpError(error);
    return throwError(() => error);
  };
}