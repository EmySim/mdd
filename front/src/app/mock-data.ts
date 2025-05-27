// src/app/mock-data.ts
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Injectable } from '@angular/core';
import { Topic } from './interfaces/topic.interface';
import { Article } from './interfaces/article.interface';

@Injectable({
  providedIn: 'root',
})
export class MockDataService implements InMemoryDbService {
  createDb() {
    const topics: Topic[] = [
      { id: '1', name: 'Angular', description: 'Framework front-end' },
      { id: '2', name: 'Spring', description: 'Back-end Java' },
    ];
    const articles: Article[] = [
      { id: '1', title: 'Bienvenue sur MDD', content: 'Contenu...', author: {id: '1', username: 'john', email: '', roles: []}, createdAt: new Date() }
      // etc.
    ];
    // Ajoute d'autres entités ici si besoin
    return { topics, articles };
  }
}
