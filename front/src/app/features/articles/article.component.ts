import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ArticleService } from './article.service';
import { Article, ArticlesPage } from '../../interfaces/article.interface';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  articles: Article[] = [];
  sortDirection: 'asc' | 'desc' = 'desc'; // 🎯 Par défaut : plus récent d'abord
  isLoading: boolean = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============================================================================
  // CHARGEMENT DES DONNÉES
  // =============================================================================

  private loadArticles(): void {
    this.isLoading = true;
    
    this.articleService.getAllArticles(0, 20, this.sortDirection).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ArticlesPage) => {
        this.articles = response.content || [];
        this.isLoading = false;
        console.log(`📰 ${this.articles.length} articles chargés`);
      },
      error: (error: Error) => {
        console.error('Erreur chargement articles:', error);
        this.isLoading = false;
      }
    });
  }

  // =============================================================================
  // TRI UNIQUEMENT
  // =============================================================================

  changeSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadArticles(); // Recharger avec nouveau tri
  }

  getSortText(): string {
    return this.sortDirection === 'asc' ? 'Plus anciens' : 'Plus récents';
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

  // =============================================================================
  // HELPERS
  // =============================================================================

  truncateContent(content: string, maxLength: number = 150): string {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }
}