// src/app/interfaces/topic.interface.ts

/**
 * Interface représentant un sujet/thème du réseau social MDD
 * Correspond à l'entité Subject côté backend
 */
export interface Topic {
  /** Identifiant unique du sujet */
  id: string;
  
  /** Nom du sujet (ex: "Angular", "Spring Boot") */
  name: string;
  
  /** Description détaillée du sujet */
  description: string;
  
  /** Date de création du sujet */
  createdAt?: Date;
  
  /** Nombre d'abonnés à ce sujet (optionnel pour l'affichage) */
  subscribersCount?: number;
  
  /** Nombre d'articles publiés sur ce sujet (optionnel) */
  articlesCount?: number;
  
  /** Indique si l'utilisateur actuel est abonné à ce sujet */
  isSubscribed?: boolean;
}

/**
 * DTO pour créer un nouveau sujet (usage administratif futur)
 */
export interface CreateTopicRequest {
  name: string;
  description: string;
}

/**
 * DTO pour mettre à jour un sujet
 */
export interface UpdateTopicRequest {
  name?: string;
  description?: string;
}