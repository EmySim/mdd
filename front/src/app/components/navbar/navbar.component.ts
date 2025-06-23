// src/app/components/navbar/navbar.component.ts - COMPLET
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  /**
   * Reçoit l'état depuis AppComponent
   * true = navbar simple (logo seulement - pages auth)
   * false = navbar complète (navigation + déconnexion - pages connectées)
   */
  @Input() isSimple: boolean = false;

  // ✅ PROPRIÉTÉ pour menu mobile
  isMobileMenuOpen: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
// ===========================
  // NAVIGATION LOGO ✅ NOUVEAU
  // ===========================

  /**
   * Redirection intelligente du logo selon l'état de connexion
   * 
   * LOGIQUE :
   * - Si utilisateur connecté → /home (fil d'actualité)
   * - Si utilisateur non connecté → /landing (page publique)
   */
  goToHomePage(): void {
    if (this.authService.isLoggedIn()) {
      console.log('🏠 Logo cliqué - Utilisateur connecté → /home');
      this.router.navigate(['/home']);
    } else {
      console.log('🚪 Logo cliqué - Utilisateur non connecté → /landing');
      this.router.navigate(['/landing']);
    }
    this.closeMobileMenu();
  }


  // ===========================
  // MÉTHODES DE NAVIGATION ✅
  // ===========================

  /**
   * Navigation vers Articles
   */
  goToArticles(): void {
    console.log('🔄 Navigation vers /articles');
    this.router.navigate(['/articles']);
    this.closeMobileMenu();
  }

  /**
   * Navigation vers Thèmes
   */
  goToThemes(): void {
    console.log('🔄 Navigation vers /themes');
    this.router.navigate(['/themes']);
    this.closeMobileMenu();
  }

  /**
   * Navigation vers Profil
   */
  goToProfile(): void {
    console.log('🔄 Navigation vers /profile');
    this.router.navigate(['/profile']);
    this.closeMobileMenu();
  }

  /**
   * Navigation vers Home (fil d'actualité)
   */
  goToHome(): void {
    console.log('🔄 Navigation vers /home');
    this.router.navigate(['/home']);
    this.closeMobileMenu();
  }

  /**
   * Déconnexion
   */
  logout(): void {
    console.log('🚪 Déconnexion en cours');
    this.authService.logout();
    this.router.navigate(['/landing']);
    this.closeMobileMenu();
  }

  // ===========================
  // GESTION MENU MOBILE ✅
  // ===========================

  /**
   * Toggle du menu mobile
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log('📱 Menu mobile:', this.isMobileMenuOpen ? 'ouvert' : 'fermé');
  }

  /**
   * Fermer le menu mobile
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // ===========================
  // ÉTAT DES ROUTES ✅
  // ===========================

  /**
   * Vérifier si une route est active
   */
  isRouteActive(route: string): boolean {
    const currentUrl = this.router.url;
    const isActive = currentUrl === route || currentUrl.startsWith(route + '/');
    
    // Debug pour voir l'état
    console.log(`🔍 Route ${route} active:`, isActive, `(URL actuelle: ${currentUrl})`);
    
    return isActive;
  }
}