// src/app/features/profile/interfaces/profile.interface.ts

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  // Optionnel : liste des abonnements si retournée par l'API
  subscribedSubjects?: any[];
}

/**
 * Interface pour les requêtes de mise à jour
 */
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  password?: string;
}