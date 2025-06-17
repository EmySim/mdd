// src/app/app.component.ts 
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'front';

  constructor(private router: Router) {}

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
    const noNavbarRoutes = ['/', '/landing'];
    
    return !noNavbarRoutes.includes(url);
  }

  /**
   * Détermine si la navbar doit être simple (logo seulement)
   * 
   * NAVBAR SIMPLE sur :
   * - /auth/login
   * - /auth/register
   * 
   * NAVBAR COMPLÈTE sur :
   * - /home, /articles, /themes, /profile
   */
  isSimpleNavbar(): boolean {
    const url = this.router.url;
    
    // Navbar simple sur les pages auth
    return url.startsWith('/auth');
    return url !== '/' && url !== '/landing';
  }

  /**
   * Détermine si la navbar doit être complète
   * (logo + navigation + déconnexion)
   */
  isCompleteNavbar(): boolean {
    return this.showNavbar() && !this.isSimpleNavbar();
  }
}