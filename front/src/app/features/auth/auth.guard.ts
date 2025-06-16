import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Guard d'authentification pour protéger les routes privées.
 * 
 * Utilise l'Observable isLoggedIn$ pour une vérification réactive
 * et redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
 * 
 * Routes protégées : /feed, /topics, /profile, /post/*, /new-post
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
   * Méthode principale du guard pour vérifier l'authentification.
   * 
   * @returns Observable<boolean | UrlTree> - true si authentifié, 
   *          sinon UrlTree vers /auth/login
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      take(1), // Prendre seulement la première valeur pour éviter les fuites mémoire
      map(isLoggedIn => {
        if (isLoggedIn) {
          console.log('✅ AuthGuard: Utilisateur authentifié - accès autorisé');
          return true;
        } else {
          console.log('🚫 AuthGuard: Utilisateur non authentifié - redirection vers login');
          // ✅ CORRECTION: Redirection vers /auth/login au lieu de /login
          return this.router.createUrlTree(['/auth/login']);
        }
      })
    );
  }
}

/**
 * Guard inverse pour les pages publiques (login, register).
 * 
 * Empêche l'accès aux pages d'authentification si l'utilisateur 
 * est déjà connecté et le redirige vers le feed.
 * 
 * Routes concernées : /auth/login, /auth/register
 */
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Méthode principale du guard pour vérifier le statut invité.
   * 
   * @returns Observable<boolean | UrlTree> - true si non connecté, 
   *          sinon UrlTree vers /feed
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        if (!isLoggedIn) {
          console.log('✅ GuestGuard: Utilisateur non connecté - accès autorisé aux pages auth');
          return true;
        } else {
          console.log('🔄 GuestGuard: Utilisateur déjà connecté - redirection vers feed');
          return this.router.createUrlTree(['/feed']);
        }
      })
    );
  }
}
