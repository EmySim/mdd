// src/app/interfaces/user.interface.ts

// ===========================
// ENTITÉS PRINCIPALES
// ===========================

/**
 * Interface de base pour un utilisateur complet
 */
export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Utilisateur avec ses abonnements (extend User)
 */
export interface UserWithSubscriptions extends User {
  subscribedSubjects: UserSubscription[];
}

/**
 * Version publique d'un utilisateur (données limitées)
 */
export interface UserPublic {
  id: number;
  username: string;
  email: string;
}

/**
 * Abonnement utilisateur à un sujet/thème
 */
export interface UserSubscription {
  id: number;
  title: string;
  description?: string;
  subscribedAt: string;
}

// ===========================
// REQUÊTES D'AUTHENTIFICATION
// ===========================

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string; 
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  createdAt: string; 
  updatedAt: string; 
}

// ===========================
// REQUÊTES DE MODIFICATION
// ===========================

/**
 * Requête de mise à jour du profil utilisateur
 */
export interface UpdateUserRequest {
  email?: string;
  username?: string;
  password?: string;
}

/**
 * Requête de changement de mot de passe
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ===========================
// TYPES UTILITAIRES
// ===========================

/**
 * Type pour les données utilisateur complètes (alias)
 */
export type UserProfile = UserWithSubscriptions;

/**
 * Type pour les requêtes de mise à jour de profil (alias)
 */
export type UpdateProfileRequest = UpdateUserRequest;