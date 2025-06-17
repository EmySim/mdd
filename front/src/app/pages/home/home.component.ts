// src/app/pages/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';

/**
 * Composant Home - Page d'accueil pour utilisateurs connectés
 * 
 * Fonctionnalités selon spécifications ORION :
 * ✅ "Consulter son fil d'actualité sur la page d'accueil une fois connecté"
 * ✅ Affichage du fil d'actualité chronologique
 * ✅ Navigation via navbar
 * 
 * Note : Cette page est protégée par AuthGuard, donc l'utilisateur est 
 * forcément connecté quand il arrive ici.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Données pour le fil d'actualité
  userEmail: string = '';
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // ✅ Utilisateur forcément connecté (AuthGuard)
    // On peut récupérer ses infos pour personnaliser l'affichage
    this.loadUserInfo();
    console.log('🏠 Page home chargée - Fil d\'actualité disponible');
  }

  /**
   * Charge les informations utilisateur pour personnaliser l'affichage
   */
  private loadUserInfo(): void {
    // Récupération simple des infos utilisateur
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email;
    }
  }
}