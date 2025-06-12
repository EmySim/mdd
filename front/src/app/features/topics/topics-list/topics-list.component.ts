// src/app/features/topics/topics-list/topics-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Topic } from '../../../interfaces/topic.interface';
import { TopicService } from '../topic.service';

@Component({
  selector: 'app-topics-list',
  templateUrl: './topics-list.component.html',
  styleUrls: ['./topics-list.component.scss']
})
export class TopicsListComponent implements OnInit, OnDestroy {
  topics: Topic[] = [];
  loading = false;
  
  private destroy$ = new Subject<void>();

  constructor(private topicService: TopicService) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des sujets
   * Erreurs gérées automatiquement par l'interceptor JWT
   */
  private loadTopics(): void {
    this.loading = true;

    this.topicService.getTopics().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (topics: Topic[]) => {
        this.topics = topics;
        this.loading = false;
      }
      // ✅ PAS de bloc error - géré par l'interceptor
      // Si erreur : interceptor → errorService → toast automatique
    });
  }

  /**
   * Bascule l'abonnement à un sujet
   */
  toggleSubscription(topic: Topic): void {
    if (topic.isSubscribed) {
      this.unsubscribeFromTopic(topic);
    } else {
      this.subscribeToTopic(topic);
    }
  }

  /**
   * S'abonner à un sujet
   * Erreurs gérées automatiquement (409 si déjà abonné, etc.)
   */
  private subscribeToTopic(topic: Topic): void {
    this.topicService.subscribe(topic.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // ✅ Mise à jour de l'état local seulement
        topic.isSubscribed = true;
        if (topic.subscribersCount) {
          topic.subscribersCount++;
        }
      }
      // ✅ PAS de bloc error - géré par l'interceptor
      // Si erreur : toast automatique "Vous êtes déjà abonné" ou autre
    });
  }

  /**
   * Se désabonner d'un sujet
   * Erreurs gérées automatiquement (409 si pas abonné, etc.)
   */
  private unsubscribeFromTopic(topic: Topic): void {
    this.topicService.unsubscribe(topic.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // ✅ Mise à jour de l'état local seulement
        topic.isSubscribed = false;
        if (topic.subscribersCount && topic.subscribersCount > 0) {
          topic.subscribersCount--;
        }
      }
    });
  }
}