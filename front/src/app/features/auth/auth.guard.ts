// src/app/features/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Guard d'authentification pour protéger les routes privées
 * 
 * Utilise l'Observable isLoggedIn$ pour une vérification réactive
 * et redirige vers la page de connexion si non authentifié
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Méthode principale du guard
   * Retourne true si l'utilisateur est connecté, sinon redirige vers /login
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      take(1), // Prendre seulement la première valeur
      map(isLoggedIn => {
        if (isLoggedIn) {
          console.log('✅ Guard: Utilisateur authentifié - accès autorisé');
          return true;
        } else {
          console.log('🚫 Guard: Utilisateur non authentifié - redirection vers login');
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}

/**
 * Guard inverse pour les pages publiques (login, register)
 * Redirige vers le feed si l'utilisateur est déjà connecté
 */
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        if (!isLoggedIn) {
          console.log('✅ GuestGuard: Utilisateur non connecté - accès autorisé');
          return true;
        } else {
          console.log('🔄 GuestGuard: Utilisateur déjà connecté - redirection vers feed');
          return this.router.createUrlTree(['/feed']);
        }
      })
    );
  }
}