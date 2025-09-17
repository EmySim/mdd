// src/app/interfaces/index.ts - BARREL EXPORTS

/**
 * Point d'entrée centralisé pour toutes les interfaces
 */

// Interfaces utilisateur
export * from './user.interface';

// Interfaces thèmes
export * from './theme.interface';

// Interfaces articles
export * from './article.interface';

// Interfaces commentaires
export {
  Comment as CommentInterface,
  CreateCommentRequest,
} from './comment.interface';
