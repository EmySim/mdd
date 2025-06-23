export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  expiresIn: number;
}

export interface MessageResponse {
  message: string;
  type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}