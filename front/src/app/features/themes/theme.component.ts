import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from './theme.service';
import { Theme, ThemesPage } from '../../interfaces/theme.interface';
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des thèmes
   */
  loadThemes(): void {
    this.isLoading = true;
    this.errorService.clearAll();

    this.themeService.getAllThemes().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (themesPage: ThemesPage) => {
        this.themes = themesPage.content;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorService.handleHttpError(error);
      },
    });
  }

  /**
   * Toggle abonnement à un thème
   */
  toggleSubscription(theme: Theme): void {
    const originalState = theme.isSubscribed;
    theme.isSubscribed = !theme.isSubscribed; // Mise à jour optimiste

    const apiCall = originalState
      ? this.themeService.unsubscribeFromTheme(theme.id)
      : this.themeService.subscribeToTheme(theme.id);

    apiCall.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // succès → rien à faire, l'état a été mis à jour
      },
      error: (error: HttpErrorResponse) => {
        theme.isSubscribed = originalState; // rollback
        this.errorService.handleHttpError(error);
      },
    });
  }

  // ===========================
  // MÉTHODES D'AFFICHAGE DES BOUTONS
  // ===========================
  getThemeButtonClass(isSubscribed: boolean): string {
    return isSubscribed ? 'btn btn--subscribed' : 'btn btn--primary';
  }

  getThemeButtonText(isSubscribed: boolean): string {
    return isSubscribed ? 'Abonné' : 'S\'abonner';
  }

  getThemeButtonTitle(isSubscribed: boolean): string {
    return isSubscribed 
      ? 'Cliquez pour vous désabonner de ce thème' 
      : 'Cliquez pour vous abonner à ce thème';
  }

  // ===========================
  // MÉTHODES UTILITAIRES
  // ===========================
  trackByThemeId(index: number, theme: Theme): number {
    return theme.id;
  }
}
