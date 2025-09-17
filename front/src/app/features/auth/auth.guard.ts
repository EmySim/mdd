// auth.guard.ts - Guards pour la gestion des accès en fonction de l'authentification
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Guard d'authentification pour protéger les routes privées.
 * 
 * Vérifie via `isLoggedIn$` si l'utilisateur est connecté.
 * Redirige vers la page de connexion si ce n'est pas le cas.
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
   * Vérifie si l'utilisateur est authentifié.
   * 
   * @returns Observable<boolean | UrlTree> - true si connecté, sinon UrlTree vers /auth/login
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      take(1), // Prend uniquement la première valeur pour éviter les fuites mémoire
      map(isLoggedIn => {
        return isLoggedIn
          ? true
          : this.router.createUrlTree(['/auth/login']);
      })
    );
  }
}

/**
 * Guard inverse pour protéger les pages publiques (login, register).
 * 
 * Si l'utilisateur est déjà connecté, il est redirigé vers /feed.
 * Sinon, il peut accéder aux pages d'authentification.
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
   * Vérifie si l'utilisateur est invité (non connecté).
   * 
   * @returns Observable<boolean | UrlTree> - true si invité, sinon UrlTree vers /feed
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        return !isLoggedIn
          ? true
          : this.router.createUrlTree(['/feed']);
      })
    );
  }
}
