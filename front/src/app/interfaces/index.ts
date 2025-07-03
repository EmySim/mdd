// src/app/interfaces/index.ts - BARREL EXPORTS

/**
 * Point d'entrée centralisé pour toutes les interfaces
 * 
 * Permet d'importer facilement :
 * import { User, Theme, Article } from '../../interfaces';
 */

// Interfaces utilisateur
export * from './user.interface';

// Interfaces thèmes
export * from './theme.interface';

// Interfaces articles
export * from './article.interface';

// Interfaces commentaires
export * from './comment.interface';

// Interfaces profil (si vous en avez d'autres à part user)
export * from './profile.interface';