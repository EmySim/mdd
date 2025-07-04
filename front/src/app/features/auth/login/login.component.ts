// ============================================================================
// LOGIN COMPONENT - IMPORTS CORRIGÉS
// src/app/features/auth/login/login.component.ts
// ============================================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable, takeUntil, map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { ErrorService } from 'src/app/services/error.service';
// ✅ Import depuis les interfaces existantes
import { LoginRequest } from '../interfaces/auth.interface';

/**
 * Composant de connexion pour l'application MDD
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  // ===========================
  // PROPRIÉTÉS DU COMPOSANT
  // ===========================
  
  loginForm: FormGroup;
  loading = false;
  isMobile$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  // ===========================
  // CONSTRUCTEUR
  // ===========================
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    public errorService: ErrorService
  ) {
    this.loginForm = this.createLoginForm();
    this.isMobile$ = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches));
  }

  // ===========================
  // CYCLE DE VIE ANGULAR
  // ===========================
  
  ngOnInit(): void {
    this.authService.isLoggedIn$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        console.log('🔄 Utilisateur déjà connecté, redirection vers /home');
        this.router.navigate(['/home']);
      }
    });
    
    console.log('🔑 Composant Login initialisé');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // FORMULAIRE
  // ===========================
  
  private createLoginForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // ===========================
  // SOUMISSION
  // ===========================
  
  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      this.errorService.clearAll();

      const credentials: LoginRequest = {
        email: this.loginForm.value.email.trim(),
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('✅ Connexion réussie, redirection vers /home');
          this.router.navigate(['/home']);
        },
        error: (httpError: HttpErrorResponse) => {
          this.loading = false;
          console.error('❌ Erreur de connexion:', httpError);
          this.errorService.handleHttpError(httpError);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // ===========================
  // VALIDATION
  // ===========================
  
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && field.touched) {
      
      if (field.errors['required']) {
        return `${fieldName === 'email' ? 'Email' : 'Mot de passe'} requis`;
      }
      if (field.errors['email']) {
        return 'Format email invalide';
      }
      if (field.errors['minlength']) {
        return 'Le mot de passe doit contenir au moins 8 caractères';
      }
    }
    return '';
  }

  // ===========================
  // NAVIGATION
  // ===========================
  
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}