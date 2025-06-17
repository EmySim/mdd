// src/app/pages/landing/landing.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

/**
 * Composant Landing - Page d'accueil publique de MDD
 * 
 * Fonctionnalités :
 * ✅ Présentation de l'application pour utilisateurs non connectés
 * ✅ Navigation vers connexion/inscription
 * ✅ Redirection automatique si déjà connecté (simple check)
 * 
 * Conforme aux spécifications ORION :
 * "Accéder au formulaire de connexion et d'inscription à partir de la page d'accueil (non connectée)"
 */
@Component({
  selector: 'app-landing',  // ✅ Nom cohérent avec le fichier
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {  // ✅ Nom cohérent

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Vérification simple au chargement - pas de subscription
    if (this.authService.isLoggedIn()) {
      console.log('🏠 Utilisateur déjà connecté → redirection vers /home');
      this.router.navigate(['/home']);  // ✅ Cohérent avec le routing
    }
  }

  /**
   * Navigation vers la page de connexion
   */
  goToLogin(): void {
    console.log('🔑 Navigation vers la connexion');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigation vers la page d'inscription  
   */
  goToRegister(): void {
    console.log('📝 Navigation vers l\'inscription');
    this.router.navigate(['/auth/register']);
  }
}