// src/app/interfaces/comment.interface.ts

import { UserPublic } from '../features/auth/interfaces/user.interface';

/**
 * Interface représentant un commentaire sur un article
 * Correspond à l'entité Comment côté backend
 */
export interface Comment {
  /** Identifiant unique du commentaire */
  id: string;
  
  /** Contenu du commentaire */
  content: string;
  
  /** Auteur du commentaire */
  author: UserPublic;
  
  /** ID de l'article commenté */
  articleId: string;
  
  /** Date de création du commentaire */
  createdAt: Date;
  
  /** Date de dernière modification */
  updatedAt?: Date;
}

/**
 * DTO pour créer un nouveau commentaire
 */
export interface CreateCommentRequest {
  /** Contenu du commentaire */
  content: string;
  
  /** ID de l'article à commenter */
  articleId: string;
}

/**
 * DTO pour mettre à jour un commentaire
 */
export interface UpdateCommentRequest {
  /** Nouveau contenu du commentaire */
  content: string;
}

/**
 * Réponse pour la liste des commentaires d'un article
 */
export interface CommentsResponse {
  /** Liste des commentaires */
  comments: Comment[];
  
  /** Nombre total de commentaires pour cet article */
  total: number;
}