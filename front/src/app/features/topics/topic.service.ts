// src/app/features/topics/topic.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Topic } from '../../interfaces/topic.interface';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les sujets disponibles
   * 
   * Les erreurs sont gérées automatiquement par l'interceptor JWT :
   * - 500 → "Erreur serveur, veuillez réessayer"
   * - 0 → "Impossible de contacter le serveur"
   * - etc.
   */
  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.API_URL}/topics`);
  }

  /**
   * S'abonner à un sujet
   * 
   * Erreurs gérées automatiquement :
   * - 409 → "Vous êtes déjà abonné à ce sujet" (si configuré dans backend)
   * - 404 → "Ce sujet n'existe pas"
   * - etc.
   */
  subscribe(topicId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/subscriptions`, { topicId });
  }

  /**
   * Se désabonner d'un sujet
   * 
   * Erreurs gérées automatiquement :
   * - 409 → "Vous n'êtes pas abonné à ce sujet"
   * - 404 → "Ce sujet n'existe pas"
   * - etc.
   */
  unsubscribe(topicId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/subscriptions/${topicId}`);
  }

  /**
   * Récupère les abonnements de l'utilisateur connecté
   */
  getUserSubscriptions(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.API_URL}/subscriptions/me`);
  }
}