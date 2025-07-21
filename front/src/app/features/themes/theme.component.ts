import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from './theme.service';
import { Theme, ThemesPage } from '../../interfaces/theme.interface'; // ✅ AJOUTÉ ThemesPage
import { ErrorService } from '../../services/error.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeComponent implements OnInit, OnDestroy {
  // ===========================
  // PROPRIÉTÉS DU COMPOSANT
  // ===========================
  themes: Theme[] = [];
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadThemes();
    console.log('📂 Page thèmes chargée');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des thèmes avec statut d'abonnement
   */
  loadThemes(): void {
    console.log(`📂 Chargement initial des thèmes`);
    this.isLoading = true;
    this.errorService.clearAll();

    this.themeService.getAllThemes().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (themesPage: ThemesPage) => {
        this.themes = themesPage.content; 
        this.isLoading = false;
        console.log(`✅ Thèmes chargés: ${themesPage.content.length}`);
        
        // 🔍 LOGS POUR DIAGNOSTIQUER LA DESCRIPTION
        console.log('📋 Réponse complète du backend:', themesPage);
        console.log('🎯 Contenu des thèmes:', themesPage.content);
        
        // Vérifier chaque thème individuellement
        themesPage.content.forEach((theme, index) => {
          console.log(`📝 Thème ${index + 1}:`);
          console.log(`  - ID: ${theme.id}`);
          console.log(`  - Nom: ${theme.name}`);
          console.log(`  - Description: "${theme.description}"`);
          console.log(`  - Type description: ${typeof theme.description}`);
          console.log(`  - Description vide/null: ${!theme.description}`);
          console.log(`  - Abonné: ${theme.isSubscribed}`);
          console.log(`  - Créé le: ${theme.createdAt}`);
          console.log('  - Objet complet:', theme);
        });

        // Vérifier si au moins un thème a une description
        const themesWithDescription = themesPage.content.filter(theme => theme.description && theme.description.trim());
        console.log(`📊 Thèmes avec description non vide: ${themesWithDescription.length}/${themesPage.content.length}`);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('❌ Erreur chargement thèmes:', error);
        this.errorService.handleHttpError(error);
      },
    });
  }

  /**
   * Toggle abonnement à un thème
   */
  toggleSubscription(theme: Theme): void {
    console.log(`🔄 Toggle abonnement thème: ${theme.name} (${theme.isSubscribed ? 'se désabonner' : 's\'abonner'})`);

    const originalState = theme.isSubscribed;
    theme.isSubscribed = !theme.isSubscribed; // Mise à jour optimiste

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
      error: (error: HttpErrorResponse) => {
        theme.isSubscribed = originalState; // Annuler la mise à jour optimiste
        console.error('❌ Erreur toggle abonnement:', error);
        this.errorService.handleHttpError(error);
      },
    });
  }

  /**
   * TrackBy pour optimiser le rendu de la liste
   */
  trackByThemeId(index: number, theme: Theme): number {
    return theme.id;
  }
}