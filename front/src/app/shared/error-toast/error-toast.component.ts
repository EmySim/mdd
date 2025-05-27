import { Component, OnInit } from '@angular/core';
import { ErrorService } from '../../core/error.service';

@Component({
  selector: 'app-error-toast',
  template: `
    <div class="error-toast" *ngIf="message">
      {{ message }}
      <button (click)="close()">✖</button>
    </div>
  `,
  styleUrls: ['./error-toast.component.scss']
})
export class ErrorToastComponent implements OnInit {
  message: string | null = null;

  constructor(private errorService: ErrorService) {}

  ngOnInit() {
    this.errorService.error$.subscribe(msg => this.message = msg);
  }

  close() {
    this.errorService.clearError();
  }
}
