import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ArticleService, Article } from './article.service';
import { ThemeService } from '../themes/theme.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  // Propriétés manquantes
  articles: Article[] = [];
  themes: any[] = [];
  selectedThemeId: number | null = null;
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // États de chargement
  isLoading = false;
  isLoadingThemes = false;
  isLoadingMore = false;
  hasMoreArticles = true;
  
  private currentPage = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private articleService: ArticleService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadThemes();
    this.loadArticles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Chargement des données
  private loadThemes(): void {
    this.isLoadingThemes = true;
    this.themeService.getAllThemes().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.themes = response.content || [];
        this.isLoadingThemes = false;
      },
      error: (error) => {
        console.error('Erreur chargement thèmes:', error);
        this.isLoadingThemes = false;
      }
    });
  }

  private loadArticles(page: number = 0, reset: boolean = true): void {
    this.isLoading = reset;
    
    this.articleService.getAllArticles(page, 10).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (reset) {
          this.articles = response.content || [];
        } else {
          this.articles = [...this.articles, ...(response.content || [])];
        }
        
        this.hasMoreArticles = !response.last;
        this.currentPage = response.number;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Erreur chargement articles:', error);
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  // Méthodes pour les actions du template
  createArticle(): void {
    this.router.navigate(['/articles/create']);
  }

  // ✅ Correction de la méthode filterByTheme
  filterByTheme(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedThemeId = value ? parseInt(value) : null;
    this.loadArticles(0, true);
  }

  changeSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadArticles(0, true);
  }

  resetFilters(): void {
    this.selectedThemeId = null;
    this.sortDirection = 'desc';
    this.loadArticles(0, true);
  }

  loadMoreArticles(): void {
    if (this.hasMoreArticles && !this.isLoadingMore) {
      this.isLoadingMore = true;
      this.loadArticles(this.currentPage + 1, false);
    }
  }

  refreshArticles(): void {
    this.loadArticles(0, true);
  }

  // ✅ Méthodes de navigation
  viewArticle(article: Article): void {
    console.log(`👀 Consultation article: ${article.title}`);
    this.router.navigate(['/articles', article.id]);
  }

  /**
   * ✅ CORRIGÉ - Signature alignée avec l'appel du template
   * Navigation vers un thème avec ses articles
   * 
   * @param themeId ID du thème à consulter
   * @param themeName Nom du thème (pour logging et UX)
   */
  viewTheme(themeId: number, themeName: string): void {
    console.log(`🎨 Navigation vers thème: ${themeName} (ID: ${themeId})`);
    
    // Option 1: Filtrer les articles du thème dans la vue actuelle
    this.selectedThemeId = themeId;
    this.loadArticles(0, true);
    
    // Option 2: Navigation vers la page thèmes (alternative)
    // this.router.navigate(['/themes'], { queryParams: { selected: themeId } });
  }

  // Méthodes utilitaires
  getSortText(): string {
    return this.sortDirection === 'asc' ? 'Plus anciens' : 'Plus récents';
  }

  getSelectedThemeName(): string {
    if (!this.selectedThemeId) return '';
    const theme = this.themes.find(t => t.id === this.selectedThemeId);
    return theme ? theme.name : '';
  }

  truncateContent(content: string, maxLength: number = 150): string {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  // ✅ TrackBy pour optimisation rendu
  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }
}