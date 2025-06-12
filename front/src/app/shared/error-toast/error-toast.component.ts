import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-toast',
  template: `
    <div class="error-toast" *ngIf="hasError">
      {{ errorMessage }}
      <button (click)="clearError()">✖</button>
    </div>
  `,
  styleUrls: ['./error-toast.component.scss']
})
export class ErrorToastComponent implements OnInit {
  
  hasError = false;
  errorMessage = '';

  constructor() { }

  ngOnInit(): void {
    // TODO: Connecter au service d'erreur global
  }

  clearError(): void {
    this.hasError = false;
    this.errorMessage = '';
  }
}