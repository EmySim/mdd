import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<string | null>(null);

  get error$(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }

  showError(message: string) {
    this.errorSubject.next(message);
    // Optionnel : reset auto au bout de X secondes
    setTimeout(() => this.clearError(), 5000);
  }

  clearError() {
    this.errorSubject.next(null);
  }
}
