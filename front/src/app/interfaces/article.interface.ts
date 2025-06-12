// src/app/interfaces/article.interface.ts

import { UserPublic } from './user.interface';
import { Topic } from './topic.interface';
import { Comment } from './comment.interface';

/**
 * Interface représentant un article du réseau social MDD
 * Correspond à l'entité Article côté backend
 */
export interface Article {
  /** Identifiant unique de l'article */
  id: string;
  
  /** Titre de l'article (200 caractères max) */
  title: string;
  
  /** Contenu de l'article (format texte/markdown) */
  content: string;
  
  /** Auteur de l'article */
  author: UserPublic;
  
  /** Sujet/thème de l'article */
  subject: Topic;
  
  /** Date de création */
  createdAt: Date;
  
  /** Date de dernière modification */
  updatedAt?: Date;
  
  /** Nombre de commentaires sur cet article */
  commentsCount?: number;
  
  /** Commentaires de l'article (chargés à la demande) */
  comments?: Comment[];
}

/**
 * Version simplifiée pour le fil d'actualité
 * Optimisée pour les performances d'affichage
 */
export interface ArticleSummary {
  id: string;
  title: string;
  /** Extrait du contenu (200 premiers caractères) */
  excerpt: string;
  author: UserPublic;
  subject: {
    id: string;
    name: string;
  };
  createdAt: Date;
  commentsCount: number;
}

/**
 * DTO pour créer un nouvel article
 */
export interface CreateArticleRequest {
  /** Titre de l'article */
  title: string;
  
  /** Contenu complet de l'article */
  content: string;
  
  /** ID du sujet associé */
  subjectId: string;
}

/**
 * DTO pour mettre à jour un article
 */
export interface UpdateArticleRequest {
  /** Nouveau titre (optionnel) */
  title?: string;
  
  /** Nouveau contenu (optionnel) */
  content?: string;
  
  /** Nouveau sujet (optionnel) */
  subjectId?: string;
}

/**
 * Interface pour les filtres du fil d'actualité
 */
export interface FeedFilters {
  /** Tri par date (asc/desc) */
  sortBy?: 'asc' | 'desc';
  
  /** Filtrer par sujet spécifique */
  subjectId?: string;
  
  /** Pagination - page courante */
  page?: number;
  
  /** Pagination - éléments par page */
  limit?: number;
}

/**
 * Réponse paginée pour les articles
 */
export interface ArticlesResponse {
  /** Liste des articles */
  articles: ArticleSummary[];
  
  /** Informations de pagination */
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}