// src/app/features/auth/login/login.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable, takeUntil, map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService, LoginRequest } from '../auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  isMobile$: Observable<boolean>; // ✅ logique responsive

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    public errorService: ErrorService
  ) {
    this.loginForm = this.createLoginForm();

    // Initialisation de l'observable responsive
    this.isMobile$ = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches));
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/feed']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Création du formulaire réactif avec validations
   */
  private createLoginForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        //Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}/)
      ]]
    });
  }

  /**
   * Soumission du formulaire de connexion
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      this.error = null;

      const credentials: LoginRequest = {
        email: this.loginForm.value.email.trim(),
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.router.navigate(['/feed']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorService.handleHttpError(error);
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Marque tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Vérifie si un champ a une erreur et a été touché
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Récupère le message d'erreur pour un champ
   */
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
      if (field.errors['pattern']) {
        return 'Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial';
      }
    }
    return '';
  }
}
