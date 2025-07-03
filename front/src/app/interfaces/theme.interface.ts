// src/app/interfaces/theme.interface.ts

/**
 * Interface représentant un thème du réseau social MDD
 * Correspond à l'entité Subject côté backend (mais nommée Theme côté frontend)
 */
export interface Theme {
  /** Identifiant unique du thème */
  id: number;
  
  /** Nom du thème (ex: "Angular", "Spring Boot") */
  name: string;
  
  /** Date de création du thème */
  createdAt: string;
  
  /** Indique si l'utilisateur actuel est abonné à ce thème */
  isSubscribed: boolean;
  
  /** Description détaillée du thème (optionnel pour évolutions futures) */
  description?: string;
  
  /** Nombre d'abonnés à ce thème (optionnel pour l'affichage) */
  subscribersCount?: number;
  
  /** Nombre d'articles publiés sur ce thème (optionnel) */
  articlesCount?: number;
}

/**
 * Réponse paginée pour les thèmes
 * Correspond à la structure de pagination standard du backend
 */
export interface ThemesPage {
  content: Theme[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
  numberOfElements: number;
}

/**
 * DTO pour créer un nouveau thème (usage administratif futur)
 */
export interface CreateThemeRequest {
  name: string;
  description?: string;
}

/**
 * DTO pour mettre à jour un thème
 */
export interface UpdateThemeRequest {
  name?: string;
  description?: string;
}