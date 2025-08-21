import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { ErrorService } from '../../../services/error.service';
import { RegisterRequest } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public errorService: ErrorService
  ) {
    this.registerForm = this.createRegisterForm();
  }

  ngOnInit(): void {
    this.errorService.clearAll();
    
    this.authService.isLoggedIn$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createRegisterForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorService.clearAll();

      const registerData: RegisterRequest = {
        email: this.registerForm.value.email.trim(),
        username: this.registerForm.value.username.trim(),
        password: this.registerForm.value.password
      };

      this.authService.register(registerData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          console.log('✅ Inscription réussie');
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('❌ Erreur d\'inscription:', error);
          this.isLoading = false;
          this.errorService.handleHttpError(error);
        }
      });
    }
  }

  // ✅ Méthodes de validation ajoutées
  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        const fieldNames: {[key: string]: string} = {
          'username': 'Nom d\'utilisateur',
          'email': 'Email',
          'password': 'Mot de passe'
        };
        return `${fieldNames[fieldName]} requis`;
      }
      if (field.errors['email']) {
        return 'Format email invalide';
      }
      if (field.errors['minlength']) {
        const minLengths: {[key: string]: number} = {
          'username': 3,
          'password': 6
        };
        const minLength = minLengths[fieldName] || 0;
        return `${fieldName === 'username' ? 'Le nom d\'utilisateur' : 'Le mot de passe'} doit contenir au moins ${minLength} caractères`;
      }
    }
    return '';
  }

  /**
   * Retour à la page précédente
   */
  goBack(): void {
    console.log('🔙 Retour à la page précédente');
    window.history.back();
  }

}