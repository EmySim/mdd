import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../features/auth/auth.service';
import { ArticleService } from '../../features/articles/article.service';
import { ThemeService } from '../../features/themes/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  // Propriétés manquantes ajoutées
  currentUser: any = null;
  recentArticles: any[] = [];
  subscribedThemes: any[] = [];
  totalArticles = 0;
  totalSubscriptions = 0;
  
  // États de chargement
  isLoadingArticles = false;
  isLoadingThemes = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private articleService: ArticleService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Chargement des données
  private loadCurrentUser(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });
  }

  private loadDashboardData(): void {
    this.loadRecentArticles();
    this.loadSubscribedThemes();
  }

  private loadRecentArticles(): void {
    this.isLoadingArticles = true;
    this.articleService.getAllArticles(0, 5).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.recentArticles = response.content || [];
        this.totalArticles = response.totalElements || 0;
        this.isLoadingArticles = false;
      },
      error: (error) => {
        console.error('Erreur chargement articles:', error);
        this.isLoadingArticles = false;
      }
    });
  }

  private loadSubscribedThemes(): void {
    this.isLoadingThemes = true;
    this.themeService.getAllThemes(0, 10).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.subscribedThemes = response.content?.filter(theme => theme.isSubscribed) || [];
        this.totalSubscriptions = this.subscribedThemes.length;
        this.isLoadingThemes = false;
      },
      error: (error) => {
        console.error('Erreur chargement thèmes:', error);
        this.isLoadingThemes = false;
      }
    });
  }

  // Méthodes pour les actions du template
  createArticle(): void {
    this.router.navigate(['/articles/create']);
  }

  viewArticle(article: any): void {
    this.router.navigate(['/articles', article.id]);
  }

  viewAllArticles(): void {
    this.router.navigate(['/articles']);
  }

  viewTheme(theme: any): void {
    this.router.navigate(['/themes', theme.id]);
  }

  viewAllThemes(): void {
    this.router.navigate(['/themes']);
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  // Méthodes utilitaires
  truncateContent(content: string, maxLength: number = 150): string {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  trackByArticleId(index: number, article: any): number {
    return article.id;
  }

  trackByThemeId(index: number, theme: any): number {
    return theme.id;
  }
}