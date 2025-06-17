// src/app/interfaces/user.interface.ts

/**
 * Interface représentant un utilisateur du réseau social MDD
 * Correspond à l'entité User côté backend
 */
export interface User {
  /** Identifiant unique de l'utilisateur */
  id: string;
  
  /** Nom d'utilisateur unique (3-20 caractères) */
  username: string;
  
  /** Adresse email unique */
  email: string;
  
  /** Rôles de l'utilisateur dans l'application */
  roles: string[];
  
  /** Date de création du compte */
  createdAt?: Date;
  
  /** Date de dernière mise à jour du profil */
  updatedAt?: Date;
}

/**
 * Interface pour les informations publiques d'un utilisateur
 * Utilisée pour l'affichage des auteurs d'articles/commentaires
 */
export interface UserPublic {
  id: string;
  username: string;
  /** Avatar URL (pour future implémentation) */
  avatarUrl?: string;
}

/**
 * DTO pour l'inscription d'un nouvel utilisateur
 */
export interface RegisterRequest {
  /** Nom d'utilisateur (3-20 caractères, lettres/chiffres/tirets/underscores) */
  username: string;
  
  /** Adresse email valide */
  email: string;
  
  /** Mot de passe (8+ caractères, avec majuscule, minuscule, chiffre) */
  password: string;
}

/**
 * DTO pour la connexion utilisateur
 */
export interface LoginRequest {
  /** Email ou nom d'utilisateur */
  email: string;
  
  /** Mot de passe */
  password: string;
}

/**
 * Réponse d'authentification avec token JWT
 */
export interface AuthResponse {
  /** Token JWT pour les requêtes authentifiées */
  token: string;
  
  /** Type de token (Bearer) */
  type: string;
  
  /** Informations de l'utilisateur connecté */
  id: string;
  username: string;
  email: string;
  
  /** Durée de validité du token en secondes */
  expiresIn: number;
}

/**
 * DTO pour la mise à jour du profil utilisateur
 */
export interface UpdateProfileRequest {
  /** Nouveau nom d'utilisateur (optionnel) */
  username?: string;
  
  /** Nouvel email (optionnel) */
  email?: string;
  
  /** Nouveau mot de passe (optionnel) */
  password?: string;
}

/**
 * Réponse générique de l'API
 */
export interface ApiResponse {
  /** Message de retour */
  message: string;
  
  /** Type de message (success, error, info, warning) */
  type: string;
  
  /** Données additionnelles (optionnel) */
  data?: any;
}