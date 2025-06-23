import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  articles: any[] = []; // Remplace 'any' par le bon type si besoin

  ngOnInit() {
    // Charge les articles ici si besoin
    // this.articles = ...
  }

  viewArticle(article: any) {
    // Ajoute la logique pour afficher un article
    // Exemple :
    // this.selectedArticle = article;
  }
}