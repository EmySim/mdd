// src/app/app.component.ts 
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {}

  /**
   * Détermine si la navbar doit être affichée
   * 
   * LOGIQUE FINALE :
   * - Landing : ❌ AUCUNE navbar
   * - Auth desktop : ✅ navbar simple
   * - Auth mobile : ❌ AUCUNE navbar (logo remplace)
   * - App : ✅ navbar complète
   */
  showNavbar(): boolean {
    const url = this.router.url;
    
    // Pas de navbar sur landing
    if (url === '/landing' || url === '/') {
      return false;
    }
    
    // Sur mobile, pas de navbar sur les pages auth
    const isAuthPage = url.startsWith('/auth');
    if (isAuthPage) {
      const isMobile = this.breakpointObserver.isMatched(Breakpoints.Handset);
      if (isMobile) {
        return false; // Pas de navbar sur mobile pour auth
      }
    }
    
    // Dans tous les autres cas, afficher la navbar
    return true;
  }

  /**
   * Détermine le type de navbar
   * 
   * RÈGLE INCHANGÉE :
   * - Si utilisateur connecté → navbar COMPLÈTE  
   * - Si utilisateur non connecté → navbar SIMPLE
   */
  isSimpleNavbar(): boolean {
    return !this.authService.isLoggedIn();
  }
}