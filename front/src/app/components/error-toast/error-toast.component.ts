import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-error-toast',
  template: `
    <div class="error-toast" *ngIf="errorMessage">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ errorMessage }}</span>
        <button class="error-close" (click)="close()">×</button>
      </div>
    </div>
  `,
  styleUrls: ['./error-toast.component.scss']
  // 🎯 PAS D'ANIMATION = Plus simple pour MVP
})
export class ErrorToastComponent implements OnInit, OnDestroy {
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.errorService.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      this.errorMessage = error;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.errorService.clearError();
  }
}