// src/app/shared/error-toast/error-toast.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ErrorService } from '../../core/error.service';

@Component({
  selector: 'app-error-toast',
  templateUrl: './error-toast.component.html',
  styleUrls: ['./error-toast.component.scss']
})
export class ErrorToastComponent implements OnInit, OnDestroy {
  message: string | null = null;
  validationErrors: {[key: string]: string} | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.errorService.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(message => {
      this.message = message;
    });

    this.errorService.validationErrors$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(errors => {
      this.validationErrors = errors;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.errorService.clearError();
  }

  closeValidation(): void {
    this.errorService.clearValidationErrors();
  }

  hasValidationErrors(): boolean {
    return !!(this.validationErrors && Object.keys(this.validationErrors).length > 0);
  }

  getValidationErrorsList(): Array<{field: string, message: string}> {
    if (!this.validationErrors) return [];
    
    return Object.entries(this.validationErrors).map(([field, message]) => ({
      field: this.translateFieldName(field),
      message
    }));
  }

  private translateFieldName(field: string): string {
    const translations: {[key: string]: string} = {
      'email': 'Email',
      'password': 'Mot de passe', 
      'username': 'Nom d\'utilisateur',
      'title': 'Titre',
      'content': 'Contenu',
      'subject': 'Sujet'
    };
    return translations[field] || field;
  }
}