// front/src/app/features/articles/article.component.ts
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
  
  // Données
  articles: Article[] = [];
  sortDirection: 'asc' | 'desc' = 'desc';
  isLoading = false;
  
  // Cleanup
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

  // Chargement des articles
  private loadArticles(): void {
    this.isLoading = true;
    
    this.articleService.getAllArticles(0, 20, this.sortDirection).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ArticlesPage) => {
        this.articles = response.content || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // Toggle tri chronologique
  changeSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadArticles();
  }

  // Navigation vers création
  createArticle(): void {
    this.router.navigate(['/articles/create']);
  }

  // Navigation vers détail avec commentaires
  viewArticle(article: Article): void {
    this.router.navigate(['/articles', article.id]);
  }

  // Tronquer le contenu pour l'aperçu
  truncateContent(content: string, maxLength: number = 150): string {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  // TrackBy pour performance
  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }
}