// front/src/app/core/error.service.ts (AMÉLIORÉ)
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * SERVICE D'ERREURS AMÉLIORÉ
 * 
 * AMÉLIORATIONS par rapport à votre version actuelle :
 * ✅ Gestion de différents types d'erreurs
 * ✅ Messages contextuels selon le type d'erreur
 * ✅ Priorités et durées variables
 * ✅ Historique des erreurs pour debugging
 * ✅ API plus riche pour les composants
 */

export interface ErrorMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
  dismissible?: boolean;
  context?: any; // Pour debug
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<ErrorMessage | null>(null);
  private errorHistory: ErrorMessage[] = [];
  private maxHistorySize = 50;

  constructor() {}

  get error$(): Observable<ErrorMessage | null> {
    return this.errorSubject.asObservable();
  }

  /**
   * MÉTHODES PUBLIQUES AMÉLIORÉES
   */

  // Votre méthode existante améliorée
  showError(message: string, title?: string, context?: any): void {
    this.displayMessage({
      type: 'error',
      title: title || 'Erreur',
      message,
      duration: 6000, // Plus long pour les erreurs
      dismissible: true,
      context
    });
  }

  // Nouvelles méthodes pour différents types
  showSuccess(message: string, title?: string): void {
    this.displayMessage({
      type: 'success',
      title: title || 'Succès',
      message,
      duration: 4000,
      dismissible: true
    });
  }

  showWarning(message: string, title?: string): void {
    this.displayMessage({
      type: 'warning',
      title: title || 'Attention',
      message,
      duration: 5000,
      dismissible: true
    });
  }

  showInfo(message: string, title?: string): void {
    this.displayMessage({
      type: 'info',
      title: title || 'Information',
      message,
      duration: 4000,
      dismissible: true
    });
  }

  /**
   * GESTION SPÉCIALISÉE DES ERREURS HTTP
   */
  handleHttpError(error: HttpErrorResponse, customMessage?: string): void {
    let title = 'Erreur de connexion';
    let message = customMessage || this.getHttpErrorMessage(error);
    
    switch (error.status) {
      case 401:
        title = 'Non autorisé';
        message = 'Veuillez vous connecter pour continuer';
        break;
      case 403:
        title = 'Accès refusé';
        message = 'Vous n\'avez pas les droits pour cette action';
        break;
      case 404:
        title = 'Non trouvé';
        message = 'La ressource demandée n\'existe pas';
        break;
      case 500:
        title = 'Erreur serveur';
        message = 'Problème temporaire du serveur';
        break;
    }

    this.showError(message, title, {
      status: error.status,
      url: error.url,
      timestamp: new Date()
    });
  }

  /**
   * GESTION DES ERREURS DE VALIDATION
   */
  handleValidationErrors(errors: {[key: string]: string}): void {
    const fieldErrors = Object.entries(errors)
      .map(([field, error]) => `${field}: ${error}`)
      .join(', ');
    
    this.showError(
      `Veuillez corriger : ${fieldErrors}`,
      'Données invalides'
    );
  }

  /**
   * VOTRE MÉTHODE CLEARERROR AMÉLIORÉE
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * NOUVELLES MÉTHODES UTILITAIRES
   */
  
  // Récupère l'historique des erreurs
  getErrorHistory(): ErrorMessage[] {
    return [...this.errorHistory];
  }

  // Vérifie s'il y a des erreurs actives
  hasActiveError(): boolean {
    return this.errorSubject.value !== null;
  }

  // Compte les erreurs par type dans l'historique
  getErrorStats(): {[key: string]: number} {
    return this.errorHistory.reduce((stats, error) => {
      stats[error.type] = (stats[error.type] || 0) + 1;
      return stats;
    }, {} as {[key: string]: number});
  }

  /**
   * MÉTHODES PRIVÉES
   */

  private displayMessage(config: Partial<ErrorMessage>): void {
    const errorMessage: ErrorMessage = {
      id: this.generateId(),
      type: config.type || 'info',
      title: config.title || '',
      message: config.message || '',
      timestamp: new Date(),
      duration: config.duration || 4000,
      dismissible: config.dismissible !== false,
      context: config.context
    };

    // Ajout à l'historique
    this.addToHistory(errorMessage);

    // Affichage
    this.errorSubject.next(errorMessage);

    // Auto-dismiss si configuré
    if (errorMessage.duration && errorMessage.duration > 0) {
      setTimeout(() => {
        if (this.errorSubject.value?.id === errorMessage.id) {
          this.clearError();
        }
      }, errorMessage.duration);
    }
  }

  private addToHistory(error: ErrorMessage): void {
    this.errorHistory.unshift(error);
    
    // Limite la taille de l'historique
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getHttpErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    const defaultMessages: {[key: number]: string} = {
      400: 'Requête invalide',
      401: 'Authentication requise',
      403: 'Accès interdit',
      404: 'Ressource non trouvée',
      408: 'Délai d\'attente dépassé',
      409: 'Conflit de données',
      422: 'Données non valides',
      429: 'Trop de requêtes',
      500: 'Erreur interne du serveur',
      502: 'Service indisponible',
      503: 'Service en maintenance',
      504: 'Délai d\'attente du serveur'
    };

    return defaultMessages[error.status] || `Erreur HTTP ${error.status}`;
  }
}