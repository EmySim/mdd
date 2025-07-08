import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AuthService } from '../../features/auth/auth.service';
import { ArticleService } from '../../features/articles/article.service';
import { ThemeService } from '../../features/themes/theme.service';
import { User } from '../../interfaces/user.interface';
import { Theme, ThemesPage } from '../../interfaces/theme.interface';
import { Article, ArticlesPage } from '../../interfaces/article.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  // =============================================================================
  // PROPRIÉTÉS PUBLIQUES
  // =============================================================================
  
  currentUser: User | null = null;
  recentArticles: Article[] = [];
  subscribedThemes: Theme[] = [];
  
  // Statistiques
  totalArticles: number = 0;        // ✅ Ajouté
  totalSubscriptions: number = 0;   // ✅ Ajouté
  
  // États de chargement
  isLoadingArticles: boolean = false;  // ✅ Ajouté
  isLoadingThemes: boolean = false;    // ✅ Ajouté
  
  readonly loading = {
    initial: true,
    articles: false,
    themes: false
  };

  // =============================================================================
  // PROPRIÉTÉS PRIVÉES
  // =============================================================================
  
  private readonly destroy$ = new Subject<void>();
  private readonly ARTICLES_LIMIT = 5;
  private readonly THEMES_LIMIT = 10;

  // =============================================================================
  // CONSTRUCTEUR
  // =============================================================================

  constructor(
    private readonly authService: AuthService,
    private readonly articleService: ArticleService,
    private readonly themeService: ThemeService,
    private readonly router: Router
  ) {}

  // =============================================================================
  // LIFECYCLE HOOKS
  // =============================================================================

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============================================================================
  // INITIALISATION
  // =============================================================================

  private initializeComponent(): void {
    this.loadCurrentUser();
    this.loadDashboardData();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user: User | null) => {
        this.currentUser = user;
        if (user) {
          console.log(`👤 Utilisateur connecté: ${user.username}`);
        }
      },
      error: (error) => {
        console.error('❌ Erreur chargement utilisateur:', error);
      }
    });
  }

  private loadDashboardData(): void {
    this.loading.initial = true;
    this.isLoadingArticles = true;
    this.isLoadingThemes = true;

    forkJoin({
      articles: this.articleService.getAllArticles(0, this.ARTICLES_LIMIT),
      themes: this.themeService.getAllThemes(0, this.THEMES_LIMIT)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ articles, themes }) => {
        this.handleArticlesResponse(articles);
        this.handleThemesResponse(themes);
        this.loading.initial = false;
        this.isLoadingArticles = false;
        this.isLoadingThemes = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement dashboard:', error);
        this.loading.initial = false;
        this.isLoadingArticles = false;
        this.isLoadingThemes = false;
      }
    });
  }

  // =============================================================================
  // GESTION DES DONNÉES
  // =============================================================================

  private handleArticlesResponse(response: ArticlesPage): void {
    this.recentArticles = response.content || [];
    this.totalArticles = response.totalElements || 0;
    console.log(`📰 ${this.recentArticles.length} articles chargés`);
  }

  private handleThemesResponse(response: ThemesPage): void {
    this.subscribedThemes = response.content?.filter(
      (theme: Theme) => theme.isSubscribed
    ) || [];
    this.totalSubscriptions = this.subscribedThemes.length;
    console.log(`🎨 ${this.subscribedThemes.length} abonnements trouvés`);
  }

  // =============================================================================
  // ACTIONS PUBLIQUES
  // =============================================================================

  createArticle(): void {
    this.router.navigate(['/articles/create']);
  }

  viewArticle(article: Article): void {
    this.router.navigate(['/articles', article.id]);
  }

  viewAllArticles(): void {
    this.router.navigate(['/articles']);
  }

  viewTheme(theme: Theme): void {
    this.router.navigate(['/themes', theme.id]);
  }

  viewAllThemes(): void {
    this.router.navigate(['/themes']);
  }

  refreshDashboard(): void {
    console.log('🔄 Actualisation du dashboard');
    this.loadDashboardData();
  }

  // =============================================================================
  // MÉTHODES UTILITAIRES
  // =============================================================================

  truncateContent(content: string, maxLength: number = 150): string {
    if (!content) return '';
    return content.length > maxLength 
      ? `${content.substring(0, maxLength)}...` 
      : content;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 17) return 'Bon après-midi';
    return 'Bonsoir';
  }

  // =============================================================================
  // TRACK BY FUNCTIONS
  // =============================================================================

  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }

  trackByThemeId(index: number, theme: Theme): number {
    return theme.id;
  }

  // =============================================================================
  // GETTERS (pour le template)
  // =============================================================================

  get isLoading(): boolean {
    return this.loading.initial || this.loading.articles || this.loading.themes;
  }

  get hasArticles(): boolean {
    return this.recentArticles.length > 0;
  }

  get hasSubscriptions(): boolean {
    return this.subscribedThemes.length > 0;
  }

  get userName(): string {
    return this.currentUser?.username || 'Utilisateur';
  }
}