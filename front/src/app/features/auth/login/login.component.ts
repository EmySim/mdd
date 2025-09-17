// login.component.ts - Formulaire de connexion utilisateur
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth.service';
import { ErrorService } from '../../../services/error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;        // Formulaire de connexion
  isLoading = false;           // Indique si une requête est en cours
  errorMessage = '';           // Message d’erreur à afficher si besoin

  private destroy$ = new Subject<void>(); // Gestion du cycle de vie des abonnements

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public errorService: ErrorService
  ) {
    this.loginForm = this.createLoginForm();
  }

  ngOnInit(): void {
    this.errorService.clearAll();

    // Redirige automatiquement si déjà connecté
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          this.router.navigate(['/articles']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Crée et initialise le formulaire de connexion
   */
  private createLoginForm(): FormGroup {
    return this.formBuilder.group({
      emailOrUsername: ['', [Validators.required, this.emailOrUsernameValidator]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  /**
   * Validateur personnalisé permettant d'accepter
   * soit un email valide, soit un nom d’utilisateur valide
   */
  private emailOrUsernameValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    if (!control.value) {
      return null; // déjà géré par "required"
    }

    const value = control.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

    if (emailRegex.test(value) || usernameRegex.test(value)) {
      return null; // valide
    }
    return { invalidEmailOrUsername: true };
  }

  /**
   * Soumission du formulaire de connexion
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorService.clearAll();

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Le backend gère le cookie HttpOnly → pas de stockage manuel du token
          this.router.navigate(['/articles']);
        },
        error: (error) => {
          this.errorService.handleHttpError(error);
          this.isLoading = false;
        },
      });
    }
  }

  /**
   * Vérifie si un champ du formulaire est invalide et a été touché
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Retourne le message d'erreur approprié pour un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return fieldName === 'emailOrUsername'
          ? "Email ou nom d'utilisateur requis"
          : 'Mot de passe requis';
      }
      if (field.errors['invalidEmailOrUsername']) {
        return "Format invalide. Utilisez un email valide ou un nom d'utilisateur (3-20 caractères)";
      }
      if (field.errors['minlength']) {
        return 'Le mot de passe doit contenir au moins 8 caractères';
      }
    }
    return '';
  }

  /**
   * Retour à la page précédente
   */
  goBack(): void {
    window.history.back();
  }
}
