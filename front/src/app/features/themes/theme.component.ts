// src/app/features/themes/theme.component.ts - REFACTORISÉ
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from './theme.service';
import { Theme, ThemesPage } from '../../interfaces/theme.interface';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit, OnDestroy {
  // ===========================
  // PROPRIÉTÉS DU COMPOSANT
  // ===========================
  themes: Theme[] = [];
  isLoading: boolean = false; // Indique si le chargement initial est en cours

  private destroy$ = new Subject<void>(); // Pour gérer la désinscription aux Observables

  constructor(
    private themeService: ThemeService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadThemes();
    console.log('🎨 Page thèmes chargée');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des thèmes avec statut d'abonnement
   * Conforme au wireframe : Pas de pagination visible, chargement initial complet.
   */
  loadThemes(): void {
    console.log('🎨 Chargement initial des thèmes');
    this.isLoading = true;
    this.errorService.clearAll(); // S'assure que les messages d'erreur précédents sont effacés

    this.themeService.getAllThemes(0, 1000).pipe( // Appelle avec une grande taille pour simuler "tout charger"
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ThemesPage) => {
        this.themes = response.content;
        this.isLoading = false;
        console.log(`✅ Thèmes chargés: ${response.content.length}`);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur chargement thèmes:', error);
        // ErrorService gère déjà l'affichage via ThemeService
      }
    });
  }

  /**
   * Toggle abonnement à un thème
   * (Logique de mise à jour optimiste conservée car elle améliore l'UX sans ajouter d'élément UI visible)
   */
  toggleSubscription(theme: Theme): void {
    console.log(`🔄 Toggle abonnement thème: ${theme.name} (${theme.isSubscribed ? 'se désabonner' : 's\'abonner'})`);

    const originalState = theme.isSubscribed;
    theme.isSubscribed = !theme.isSubscribed; // Mise à jour optimiste de l'état

    const apiCall = originalState
      ? this.themeService.unsubscribeFromTheme(theme.id)
      : this.themeService.subscribeToTheme(theme.id);

    apiCall.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        const action = originalState ? 'désabonné de' : 'abonné à';
        console.log(`✅ ${action} ${theme.name}`);
      },
      error: (error) => {
        theme.isSubscribed = originalState; // Annuler la mise à jour optimiste en cas d'erreur
        console.error('❌ Erreur toggle abonnement:', error);
        // ErrorService gère déjà l'affichage
      }
    });
  }

  /**
   * TrackBy pour optimiser le rendu de la liste
   */
  trackByThemeId(index: number, theme: Theme): number {
    return theme.id;
  }
}