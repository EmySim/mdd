// src/app/pages/home/home.component.ts 
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../features/auth/auth.service';
import { ArticleService, Article, ArticlesPage } from '../../features/articles/article.service';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  userEmail: string = '';
  articles: Article[] = [];
  isLoading: boolean = false;
  currentPage: number = 0;
  totalPages: number = 0;
  hasMoreArticles: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private articleService: ArticleService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadPersonalizedFeed();
    console.log('🏠 Page home chargée - Récupération du fil d\'actualité');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les informations utilisateur
   */
  private loadUserInfo(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.userEmail = user.username || user.email;
        console.log(`👤 Utilisateur connecté: ${this.userEmail}`);
      } else {
        // Fallback si pas d'Observable user mais token présent
        const token = this.authService.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.userEmail = payload.email || payload.sub || 'Développeur';
          } catch (error) {
            console.warn('Impossible de décoder le token JWT', error);
            this.userEmail = 'Développeur';
          }
        }
      }
    });
  }

  /**
   * Charge le fil d'actualité personnalisé
   */
  loadPersonalizedFeed(page = 0): void {
    console.log(`📱 Chargement du fil page ${page}`);
    this.isLoading = true;
    this.errorService.clearAll();

    this.articleService.getPersonalizedFeed(page, 20).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ArticlesPage) => {
        if (page === 0) {
          this.articles = response.content;
        } else {
          this.articles = [...this.articles, ...response.content];
        }
        
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.hasMoreArticles = !response.last;
        this.isLoading = false;

        console.log(`✅ Fil chargé: ${response.content.length} articles (page ${page})`);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur chargement fil:', error);
      }
    });
  }

  /**
   * Charge plus d'articles (pagination)
   */
  loadMoreArticles(): void {
    if (!this.isLoading && this.hasMoreArticles) {
      this.loadPersonalizedFeed(this.currentPage + 1);
    }
  }

  /**
   * Rafraîchit le fil d'actualité
   */
  refreshFeed(): void {
    console.log('🔄 Rafraîchissement du fil');
    this.currentPage = 0;
    this.loadPersonalizedFeed(0);
  }

  /**
   * Affiche un article
   */
  viewArticle(article: Article): void {
    console.log(`👀 Ouverture article: ${article.title}`);
    // TODO: Navigation vers article détaillé
  }

  /**
   * Affiche les articles d'un thème
   */
  viewTheme(themeId: number, themeName: string): void {  // ✅ Renommé de viewSubject
    console.log(`🎨 Ouverture thème: ${themeName}`);
    // TODO: Navigation vers articles du thème
  }

  /**
   * TrackBy pour optimiser le rendu
   */
  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }
}