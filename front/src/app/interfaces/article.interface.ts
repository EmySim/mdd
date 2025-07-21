// src/app/interfaces/article.interface.ts
// Importez l'interface Comment du fichier centralisé
import { Comment } from './comment.interface';

export interface Article {
  id: number;
  title: string;
  content: string;
  authorUsername: string; 
  createdAt: string;
  updatedAt: string;
  subjectId: number;
  subjectName: string; 
  themeId: number; 
  themeName: string; 
  commentsCount?: number; 
}

export interface ArticlesPage {
  content: Article[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort?: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  subjectId: number; // Ou themeId
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  subjectId?: number; // Ou themeId
}

// ArticleDetail inclut désormais les commentaires directement
export interface ArticleDetail extends Article {
  comments: Comment[]; 
}