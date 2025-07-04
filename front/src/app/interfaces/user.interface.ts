// ============================================================================
// INTERFACES USER - VERSION MVP SIMPLIFIÉE
// src/app/interfaces/user.interface.ts
// ============================================================================

/**
 * Interface principale pour un utilisateur
 * Utilisée partout : auth, profil, affichage public
 */
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface pour mettre à jour le profil utilisateur
 */
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
}