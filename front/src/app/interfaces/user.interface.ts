export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  password?: string;  // ✅ Ajout de la propriété password
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserPublic {
  id: number;
  username: string;
  email: string;
}