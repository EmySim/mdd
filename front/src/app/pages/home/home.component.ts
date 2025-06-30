// src/app/pages/home/home.component.ts - CORRECTION STOCKAGE TOKEN
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
   * 🔧 CORRECTION: Utilise AuthService au lieu du localStorage direct
   */
  private loadUserInfo(): void {
    // ✅ AVANT (incorrect):
    // const token = localStorage.getItem('token');
    
    // ✅ APRÈS (correct):
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.userEmail = user.username || user.email;
        console.log(`👤 Utilisateur connecté: ${this.userEmail}`);
      } else {
        // Fallback si pas d'Observable user mais token présent
        const token = this.authService.getToken(); // Utilise la méthode du service
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

  // Le reste des méthodes reste identique...
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

  loadMoreArticles(): void {
    if (!this.isLoading && this.hasMoreArticles) {
      this.loadPersonalizedFeed(this.currentPage + 1);
    }
  }

  refreshFeed(): void {
    console.log('🔄 Rafraîchissement du fil');
    this.currentPage = 0;
    this.loadPersonalizedFeed(0);
  }

  viewArticle(article: Article): void {
    console.log(`👀 Ouverture article: ${article.title}`);
    // TODO: Navigation vers article détaillé
  }

  viewSubject(subjectId: number, subjectName: string): void {
    console.log(`📂 Ouverture sujet: ${subjectName}`);
    // TODO: Navigation vers articles du sujet
  }

  /**
   * TrackBy pour optimiser le rendu
   */
  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }
}