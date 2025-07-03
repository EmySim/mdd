// src/app/features/articles/article.component.ts - MIS À JOUR POUR THEME
import { Component, OnInit } from '@angular/core';
import { Article } from './article.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  articles: Article[] = [];

  ngOnInit() {
    // Charge les articles ici si besoin
    console.log('📰 Composant Article initialisé');
  }

  /**
   * Affiche un article (navigation vers le détail)
   */
  viewArticle(article: Article) {
    console.log(`👀 Consultation article: ${article.title}`);
    // TODO: Implémenter la navigation vers l'article détaillé
    // Exemple : this.router.navigate(['/articles', article.id]);
  }

  /**
   * Affiche les articles d'un thème
   */
  viewTheme(themeId: number, themeName: string) {  // ✅ Renommé de viewSubject
    console.log(`🎨 Consultation thème: ${themeName}`);
    // TODO: Implémenter la navigation vers les articles du thème
    // Exemple : this.router.navigate(['/themes', themeId, 'articles']);
  }

  /**
   * TrackBy pour optimiser le rendu
   */
  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }
}