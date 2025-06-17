// src/app/pages/home/home.component.ts -
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';

/**
 * Composant Home - Page d'accueil pour utilisateurs connectés
 * 
 * Fonctionnalités :
 * ✅ Affichage du fil d'actualité
 * ✅ Navigation via navbar
 * ✅ Gestion de l'état de chargement
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // ===========================
  // PROPRIÉTÉS DU COMPOSANT
  // ===========================
  userEmail: string = '';
  hasFeedComponent: boolean = false; // ✅ AJOUTÉ - Pour gérer l'affichage conditionnel
  isLoading: boolean = false;
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // ✅ Utilisateur forcément connecté (AuthGuard)
    this.loadUserInfo();
    console.log('🏠 Page home chargée - Fil d\'actualité disponible');
  }

  /**
   * Charge les informations utilisateur pour personnaliser l'affichage
   */
  private loadUserInfo(): void {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Décodage simple du JWT pour récupérer l'email
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userEmail = payload.email || payload.sub || 'Utilisateur';
      }
    } catch (error) {
      console.warn('Impossible de récupérer les infos utilisateur', error);
      this.userEmail = 'Développeur';
    }
  }
}