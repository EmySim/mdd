// src/app/features/themes/subject.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SubjectService, Subject as SubjectModel, SubjectsPage } from './subject.service';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-subject',
  templateUrl: './subject.component.html',
  styleUrls: ['./subject.component.scss']
})
export class SubjectComponent implements OnInit, OnDestroy {
  // ===========================
  // PROPRIÉTÉS DU COMPOSANT
  // ===========================
  subjects: SubjectModel[] = [];
  isLoading: boolean = false; // Indique si le chargement initial est en cours

  private destroy$ = new Subject<void>(); // Pour gérer la désinscription aux Observables

  constructor(
    private subjectService: SubjectService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
    console.log('📂 Page sujets chargée');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des sujets avec statut d'abonnement
   * Conforme au wireframe : Pas de pagination visible, chargement initial complet.
   */
  loadSubjects(): void { // Simplifié pour ne pas prendre de paramètre de page
    console.log(`📂 Chargement initial des sujets`);
    this.isLoading = true;
    this.errorService.clearAll(); // S'assure que les messages d'erreur précédents sont effacés

    this.subjectService.getAllSubjects(0, 1000).pipe( // Appelle avec une grande taille pour simuler "tout charger"
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: SubjectsPage) => {
        this.subjects = response.content;
        this.isLoading = false;
        console.log(`✅ Sujets chargés: ${response.content.length}`);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur chargement sujets:', error);
        // ErrorService gère déjà l'affichage via SubjectService
      }
    });
  }

  /**
   * Toggle abonnement à un sujet
   * (Logique de mise à jour optimiste conservée car elle améliore l'UX sans ajouter d'élément UI visible)
   */
  toggleSubscription(subject: SubjectModel): void {
    console.log(`🔄 Toggle abonnement sujet: ${subject.name} (${subject.isSubscribed ? 'se désabonner' : 's\'abonner'})`);

    const originalState = subject.isSubscribed;
    subject.isSubscribed = !subject.isSubscribed; // Mise à jour optimiste de l'état

    const apiCall = originalState
      ? this.subjectService.unsubscribeFromSubject(subject.id)
      : this.subjectService.subscribeToSubject(subject.id);

    apiCall.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        const action = originalState ? 'désabonné de' : 'abonné à';
        console.log(`✅ ${action} ${subject.name}`);
      },
      error: (error) => {
        subject.isSubscribed = originalState; // Annuler la mise à jour optimiste en cas d'erreur
        console.error('❌ Erreur toggle abonnement:', error);
        // ErrorService gère déjà l'affichage
      }
    });
  }

  /**
   * TrackBy pour optimiser le rendu de la liste
   */
  trackBySubjectId(index: number, subject: SubjectModel): number {
    return subject.id;
  }
}