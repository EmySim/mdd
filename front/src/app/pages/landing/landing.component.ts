// src/app/pages/landing/landing.component.ts - CORRIGÉ
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

/**
 * Composant Landing - Page d'accueil publique
 * 
 * Fonctionnalités :
 * ✅ Présentation de l'application
 * ✅ Navigation vers connexion/inscription
 * ✅ Redirection automatique si déjà connecté
 */
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Vérification simple au chargement
    this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        console.log('🏠 Utilisateur déjà connecté → redirection vers /home');
        this.router.navigate(['/home']);
      }
    });
  }

  // ===========================
  // MÉTHODES DE NAVIGATION ✅ AJOUTÉES
  // ===========================
  
  /**
   * Navigation vers la page de connexion
   */
  navigateToLogin(): void {  // ✅ AJOUTÉ - Méthode manquante
    console.log('🔑 Navigation vers la connexion');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigation vers la page d'inscription  
   */
  navigateToRegister(): void {  // ✅ AJOUTÉ - Méthode manquante
    console.log('📝 Navigation vers l\'inscription');
    this.router.navigate(['/auth/register']);
  }

  // Alias pour compatibilité (si utilisé ailleurs)
  goToLogin(): void {
    this.navigateToLogin();
  }

  goToRegister(): void {
    this.navigateToRegister();
  }
}