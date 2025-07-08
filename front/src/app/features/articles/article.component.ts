import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ArticleService } from './article.service';
import { ThemeService } from '../themes/theme.service';
import { Article, ArticlesPage } from '../../interfaces/article.interface';
import { Theme, ThemesPage } from '../../interfaces/theme.interface';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  articles: Article[] = [];
  themes: Theme[] = [];
  selectedThemeId: number | null = null;
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // États de chargement
  isLoading: boolean = false;
  isLoadingThemes: boolean = false;
  isLoadingMore: boolean = false;
  hasMoreArticles: boolean = true;
  
  private currentPage: number = 0;
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

  // =============================================================================
  // CHARGEMENT DES DONNÉES
  // =============================================================================

  private loadThemes(): void {
    this.isLoadingThemes = true;
    this.themeService.getAllThemes().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ThemesPage) => {
        this.themes = response.content || [];
        this.isLoadingThemes = false;
      },
      error: (error: Error) => {
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
      next: (response: ArticlesPage) => {
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
      error: (error: Error) => {
        console.error('Erreur chargement articles:', error);
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  // =============================================================================
  // FILTRES ET TRI
  // =============================================================================

  filterByTheme(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedThemeId = value ? parseInt(value, 10) : null;
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

  // =============================================================================
  // NAVIGATION
  // =============================================================================

  createArticle(): void {
    this.router.navigate(['/articles/create']);
  }

  viewArticle(article: Article): void {
    this.router.navigate(['/articles', article.id]);
  }

  viewTheme(themeId: number, themeName: string): void {
    this.router.navigate(['/themes', themeId]);
  }

  // =============================================================================
  // PAGINATION
  // =============================================================================

  loadMoreArticles(): void {
    if (!this.isLoadingMore && this.hasMoreArticles) {
      this.isLoadingMore = true;
      this.loadArticles(this.currentPage + 1, false);
    }
  }

  refreshArticles(): void {
    this.loadArticles(0, true);
  }

  // =============================================================================
  // HELPERS
  // =============================================================================

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

  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }
}