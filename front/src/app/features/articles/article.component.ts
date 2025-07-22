import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ArticleService } from './article.service';
import { CommentService } from '../comments/comment.service';
import { Article, ArticlesPage } from '../../interfaces/article.interface';
import { Comment, CommentsPage } from '../../interfaces/comment.interface';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  
  // ===========================
  // PROPRIÉTÉS EXISTANTES (liste)
  // ===========================
  articles: Article[] = [];
  sortDirection: 'asc' | 'desc' = 'desc';
  isLoading = false;
  

  selectedArticle: Article | null = null;
  comments: Comment[] = [];
  showDetailView = false;
  
  // Cleanup existant
  private destroy$ = new Subject<void>();

  constructor(
    private articleService: ArticleService,
    private commentService: CommentService, 
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const articleId = params['id'];
      if (articleId) {
        this.loadArticleDetail(+articleId);
      } else {
        this.loadArticles(); 
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // MÉTHODES (liste)
  // ===========================

  private loadArticles(): void {
    this.showDetailView = false; 
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

  changeSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadArticles();
  }

  createArticle(): void {
    this.router.navigate(['/articles/create']);
  }

  viewArticle(article: Article): void {
    this.router.navigate(['/articles', article.id]);
  }

  truncateContent(content: string, maxLength: number = 150): string {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }

  // ===========================
  // MÉTHODES (détail avec commentaires)
  // ===========================

  /**
   * Charge un article en détail avec ses commentaires
   */
  private loadArticleDetail(articleId: number): void {
    this.showDetailView = true;
    this.isLoading = true;
    
    // Charger l'article
    this.articleService.getArticleById(articleId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (article) => {
        this.selectedArticle = article;
        this.loadComments(articleId); 
      },
      error: (error) => {
        console.error('❌ Erreur chargement article:', error);
        this.router.navigate(['/articles']);
      }
    });
  }

  /**
   * Charge les commentaires d'un article
   */
  private loadComments(articleId: number): void {
    this.commentService.getCommentsByArticle(articleId, 0, 100).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (commentsPage: CommentsPage) => {
        this.comments = commentsPage.content || [];
        this.isLoading = false;
        console.log('✅ Article et commentaires chargés');
      },
      error: (error) => {
        console.error('❌ Erreur chargement commentaires:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Retour vers la liste d'articles
   */
  goBackToList(): void {
    this.router.navigate(['/articles']);
  }

  /**
   * Formate une date pour l'affichage
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}