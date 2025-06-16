import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

/**
 * Composant de la page d'accueil/landing page de MDD.
 * 
 * Cette page est le point d'entrée de l'application pour les utilisateurs
 * non connectés. Elle présente l'application et propose les actions :
 * - Navigation vers la page de connexion
 * - Navigation vers la page d'inscription
 * - Redirection automatique vers le feed si l'utilisateur est déjà connecté
 * 
 * Responsive design pour mobile et desktop.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Vérification automatique si l'utilisateur est déjà connecté
    // Si c'est le cas, redirection vers le feed
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        console.log('🔄 Utilisateur déjà connecté, redirection vers le feed');
        this.router.navigate(['/feed']);
      }
    });
  }

  /**
   * Navigation vers la page de connexion.
   * Route finale : /login
   */
  navigateToLogin(): void {
    console.log('🔑 Navigation vers la page de connexion');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigation vers la page d'inscription.
   * Route finale : /register
   */
  navigateToRegister(): void {
    console.log('📝 Navigation vers la page d\'inscription');
    this.router.navigate(['/auth/register']);
  }

  /**
   * Méthode héritée du composant original pour la compatibilité.
   * Peut être supprimée si plus utilisée.
   */
  start(): void {
    console.log('🚀 Méthode start() appelée - redirection vers connexion');
    this.navigateToLogin();
  }
}