// ============================================================================
// REGISTER COMPONENT - IMPORTS CORRIGÉS
// src/app/features/auth/register/register.component.ts
// ============================================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { ErrorService } from '../../../services/error.service';
// ✅ Import depuis les interfaces existantes
import { RegisterRequest, LoginRequest } from '../interfaces/auth.interface';

/**
 * Composant d'inscription pour l'application MDD
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  // ===========================
  // PROPRIÉTÉS
  // ===========================
  
  registerForm: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  // ===========================
  // CONSTRUCTEUR
  // ===========================
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public errorService: ErrorService
  ) {
    this.registerForm = this.createRegisterForm();
  }

  // ===========================
  // CYCLE DE VIE
  // ===========================
  
  ngOnInit(): void {
    console.log('📝 Composant Register initialisé');
    
    this.authService.isLoggedIn$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        console.log('🔄 Utilisateur déjà connecté, redirection vers /home');
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // FORMULAIRE
  // ===========================
  
  private createRegisterForm(): FormGroup {
    return this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        this.passwordValidator
      ]]
    });
  }

  // ===========================
  // VALIDATEUR PERSONNALISÉ
  // ===========================
  
  private passwordValidator = (control: any) => {
    const value = control.value;
    if (!value) return null;

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

    return isValid ? null : { invalidPassword: true };
  };

  // ===========================
  // SOUMISSION
  // ===========================
  
  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorService.clearAll();
      
      const registerData: RegisterRequest = {
        username: this.registerForm.value.username.trim(),
        email: this.registerForm.value.email.trim(),
        password: this.registerForm.value.password
      };
      
      this.authService.register(registerData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          console.log('✅ Inscription réussie:', response.message);
          this.performAutoLogin(registerData);
        },
        error: (httpError: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('❌ Erreur d\'inscription:', httpError);
          this.errorService.handleHttpError(httpError);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private performAutoLogin(registerData: RegisterRequest): void {
    const loginData: LoginRequest = {
      email: registerData.email,
      password: registerData.password
    };
    
    this.authService.login(loginData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (loginResponse) => {
        this.isLoading = false;
        console.log('✅ Connexion automatique réussie');
        this.router.navigate(['/home']);
      },
      error: (loginError: HttpErrorResponse) => {
        this.isLoading = false;
        console.warn('❌ Erreur connexion automatique - redirection vers login');
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // ===========================
  // VALIDATION
  // ===========================
  
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
        return `${fieldNames[fieldName] || fieldName} requis`;
      }
      
      if (field.errors['email']) {
        return 'Format email invalide';
      }
      
      if (field.errors['minlength']) {
        return `Le nom d'utilisateur doit contenir au moins 3 caractères`;
      }
      
      if (field.errors['maxlength']) {
        return `Le nom d'utilisateur ne peut pas dépasser 20 caractères`;
      }
      
      if (field.errors['pattern']) {
        return 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores';
      }
      
      if (field.errors['invalidPassword']) {
        return 'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre';
      }
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  // ===========================
  // NAVIGATION
  // ===========================
  
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}