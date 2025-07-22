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
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

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

  private createLoginForm(): FormGroup {
    return this.formBuilder.group({
      emailOrUsername: [
        '',
        [Validators.required, this.emailOrUsernameValidator],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  // Validateur personnalisé pour email ou nom d'utilisateur
  private emailOrUsernameValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Laisse la validation 'required' gérer les valeurs vides
    }

    const value = control.value.trim();
    //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/; // 3-20 caractères, lettres, chiffres, _ et -

    //if (emailRegex.test(value) || usernameRegex.test(value)) {
    //  return null; // Valide
    //}

    //return { invalidEmailOrUsername: true };
    return null; // Pas de validation stricte pour l'instant
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorService.clearAll();

      console.log('🔍 Données envoyées:', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('✅ RÉPONSE COMPLÈTE DU BACKEND:', response);

          // Sauvegarder le token ET l'ID utilisateur
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.id.toString());

          console.log('✅ Connexion réussie');
          this.router.navigate(['/articles']);
        },
        error: (error) => {
          console.error('❌ Erreur de connexion:', error);
          this.errorService.handleHttpError(error);
          this.isLoading = false;
        },
      });
    }
  }

  // Méthodes de validation
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

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
        return 'Le mot de passe doit contenir au moins 6 caractères';
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
