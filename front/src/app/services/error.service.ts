// src/app/core/error.service.ts 
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Service d'erreurs MVP - cohérent avec le GlobalExceptionHandler backend
 * 
 * Fonctionnalités :
 * ✅ Compatible avec votre interface actuelle (string | null)
 * ✅ Gestion des réponses backend (MessageResponse)
 * ✅ Erreurs de validation par champ (400)
 * ✅ Messages backend directement affichés
 *
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  // Interface 
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  // Pour les erreurs de validation par champ (400)
  private validationErrorsSubject = new BehaviorSubject<{[key: string]: string} | null>(null);

  constructor() {}

  //  INTERFACE
  get error$(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }

  //  interface pour erreurs de validation
  get validationErrors$(): Observable<{[key: string]: string} | null> {
    return this.validationErrorsSubject.asObservable();
  }

  /**
   *  MÉTHODE EXISTANTE 
   */
  showError(message: string): void {
    this.errorSubject.next(message);
    this.clearValidationErrors(); // Clear validation si erreur générale
    setTimeout(() => this.clearError(), 5000);
  }

  /**
   *  VOTRE MÉTHODE EXISTANTE - 100% COMPATIBLE  
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   *  Gestion des réponses HTTP du backend
   * Utilise directement les messages du GlobalExceptionHandler
   */
  handleHttpError(error: HttpErrorResponse): void {
    console.error('HTTP Error:', error);

    if (error.status === 400 && error.error?.errors) {
      // Erreurs de validation (400) - affichage par champ
      this.showValidationErrors(error.error.errors);
    } else if (error.error?.message) {
      // Autres erreurs - utilise le message du backend
      this.showError(error.error.message);
    } else {
      // Fallback pour erreurs sans message structuré
      this.showError(this.getDefaultErrorMessage(error.status));
    }
  }

  /**
   *  Gestion des erreurs de validation (400)
   */
  showValidationErrors(errors: {[key: string]: string}): void {
    this.validationErrorsSubject.next(errors);
    this.clearError(); // Clear message général si erreurs de validation
    
    // Auto-clear après 10 secondes (plus long car utilisateur doit corriger)
    setTimeout(() => this.clearValidationErrors(), 10000);
  }

  /**
   *  Clear des erreurs de validation
   */
  clearValidationErrors(): void {
    this.validationErrorsSubject.next(null);
  }

  /**
   *  Clear
   */
  clearAll(): void {
    this.clearError();
    this.clearValidationErrors();
  }

  /**
   * Messages par défaut si pas de message backend
   */
  private getDefaultErrorMessage(status: number): string {
    const messages: {[key: number]: string} = {
      401: 'Veuillez vous reconnecter',
      403: 'Vous n\'avez pas les permissions pour cette action',
      404: 'Ressource non trouvée',
      409: 'Cette donnée existe déjà',
      422: 'Données invalides',
      500: 'Erreur serveur, veuillez réessayer',
      0: 'Impossible de contacter le serveur'
    };
    
    return messages[status] || `Erreur ${status}`;
  }
}