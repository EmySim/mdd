// src/app/app.component.ts 
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './features/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'front MDD';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Détermine si la navbar doit être affichée
   * 
   * AUCUNE NAVBAR sur :
   * - / (racine)
   * - /landing (page publique)
   * 
   * NAVBAR VISIBLE sur :
   * - /auth/* (simple - logo seulement)
   * - /home, /articles, /themes, /profile (complète)
   */
  showNavbar(): boolean {
    const url = this.router.url;
    
    // Pas de navbar sur ces routes
    return url !== '/landing' && url !== '/';
  }

  /**
   * Détermine le type de navbar
   * 
   * RÈGLE SIMPLE :
   * - Si utilisateur connecté → navbar COMPLÈTE  
   * - Si utilisateur non connecté → navbar SIMPLE
   */
  isSimpleNavbar(): boolean {
    // ✅ Simple = non connecté, Complète = connecté
    return !this.authService.isLoggedIn();
  }

}