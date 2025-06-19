// ============================================================================
// LOGIN COMPONENT - Connexion utilisateur MDD  
// ============================================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable, takeUntil, map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService, LoginRequest } from '../auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Composant de connexion pour l'application MDD
 * 
 * Fonctionnalités :
 * - Formulaire réactif avec validation frontend
 * - Gestion responsive intégrée
 * - Gestion d'erreurs complète (frontend + backend)
 * - Redirection automatique si déjà connecté
 * - Compatible avec ErrorService centralisé
 * - Gestion de la mémoire (OnDestroy pattern)
 * 
 * @author MDD Team  
 * @version 1.0.0
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
  
  /** Formulaire réactif de connexion */
  loginForm: FormGroup;
  
  /** État de chargement pour UX pendant l'authentification */
  loading = false;
  
  /** Message d'erreur local (legacy - ErrorService privilégié) */
  error: string | null = null;
  
  /** Observable pour détection responsive mobile/desktop */
  isMobile$: Observable<boolean>;

  /** Subject pour gérer les désabonnements et éviter les fuites mémoire */
  private destroy$ = new Subject<void>();

  // ===========================
  // CONSTRUCTEUR ET INJECTION
  // ===========================
  
  /**
   * Constructeur du composant de connexion
   * 
   * @param formBuilder - Service Angular pour formulaires réactifs
   * @param authService - Service d'authentification MDD
   * @param router - Service de navigation Angular
   * @param breakpointObserver - Service Angular CDK pour responsive
   * @param errorService - Service de gestion d'erreurs centralisé (PUBLIC pour template)
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    public errorService: ErrorService  // ✅ PUBLIC pour accès dans le template
  ) {
    // Initialisation du formulaire de connexion
    this.loginForm = this.createLoginForm();

    // Configuration de la détection responsive
    this.isMobile$ = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches));
  }

  // ===========================
  // CYCLE DE VIE ANGULAR
  // ===========================
  
  /**
   * Initialisation du composant
   * 
   * Configure la surveillance de l'état de connexion pour redirection automatique
   * Si l'utilisateur est déjà connecté, redirige vers /home
   */
  ngOnInit(): void {
    // Surveillance de l'état de connexion avec gestion mémoire
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

  /**
   * Nettoyage lors de la destruction du composant
   * 
   * Pattern OnDestroy pour éviter les fuites mémoire en désabonnant
   * tous les observables via le Subject destroy$
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    console.log('🧹 Composant Login détruit - observables nettoyés');
  }

  // ===========================
  // CONFIGURATION DU FORMULAIRE
  // ===========================
  
  /**
   * Création du formulaire réactif avec validations
   * 
   * Validations appliquées :
   * - Email : requis + format email valide
   * - Mot de passe : requis + minimum 8 caractères
   * 
   * @returns FormGroup configuré avec validations
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
        // ✅ Pattern complexe désactivé pour MVP, peut être réactivé si besoin
        //Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}/)
      ]]
    });
  }

  // ===========================
  // GESTION DE LA SOUMISSION
  // ===========================
  
  /**
   * Gère la soumission du formulaire de connexion
   * 
   * Processus :
   * 1. Validation du formulaire côté client
   * 2. Préparation des données de connexion
   * 3. Appel API de connexion via AuthService
   * 4. Gestion des réponses (succès = redirection, erreur = affichage)
   * 5. Gestion automatique du token JWT et de l'état utilisateur
   */
  onSubmit(): void {
    // Vérifications préalables
    if (this.loginForm.valid && !this.loading) {
      // Début du processus de connexion
      this.loading = true;
      this.error = null;
      this.errorService.clearAll(); // ✅ Nettoyage de toutes les erreurs

      // Préparation des données avec nettoyage des espaces
      const credentials: LoginRequest = {
        email: this.loginForm.value.email.trim(),
        password: this.loginForm.value.password
      };

      // Appel API de connexion avec gestion mémoire
      this.authService.login(credentials).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loading = false;
          console.log('✅ Connexion réussie, redirection vers /home');
          // ✅ Redirection vers page d'accueil après connexion réussie
          this.router.navigate(['/home']);
        },
        error: (httpError: HttpErrorResponse) => {
          this.loading = false;
          console.error('❌ Erreur de connexion:', httpError);
          // ✅ Délégation complète au ErrorService pour gestion cohérente
          this.errorService.handleHttpError(httpError);
        }
      });
    } else {
      // Formulaire invalide - forcer l'affichage des erreurs
      this.markFormGroupTouched();
    }
  }

  // ===========================
  // MÉTHODES DE VALIDATION FRONTEND
  // ===========================
  
  /**
   * Marque tous les champs du formulaire comme touchés
   * 
   * Force l'affichage des erreurs sur tous les champs
   * Utilisée quand l'utilisateur tente de soumettre un formulaire invalide
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Vérifie si un champ spécifique a une erreur et a été touché
   * 
   * @param fieldName - Nom du champ à vérifier ('email' ou 'password')
   * @returns true si le champ a une erreur et a été touché
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Récupère le message d'erreur approprié pour un champ donné
   * 
   * Fournit des messages d'erreur localisés selon le type de validation
   * 
   * @param fieldName - Nom du champ ('email' ou 'password')
   * @returns Message d'erreur localisé ou chaîne vide
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && field.touched) {
      
      // Gestion des erreurs par type
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

  // ===========================
  // MÉTHODES DE NAVIGATION
  // ===========================
  
  /**
   * Navigation vers la page d'inscription
   * 
   * Utilisée par le lien "Pas encore de compte ?" dans le template
   */
  goToRegister(): void {
    console.log('🔄 Navigation vers register depuis login');
    this.router.navigate(['/auth/register']);
  }
}