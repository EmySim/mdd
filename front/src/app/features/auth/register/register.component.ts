// ============================================================================
// REGISTER COMPONENT - Inscription utilisateur MDD
// ============================================================================

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ErrorService } from '../../../services/error.service';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Composant d'inscription pour l'application MDD
 * 
 * Fonctionnalités :
 * - Formulaire réactif avec validation frontend
 * - Gestion d'erreurs intégrée (frontend + backend)
 * - Validation de mot de passe personnalisée
 * - Navigation automatique après inscription
 * - Compatible avec ErrorService centralisé
 * 
 * @author MDD Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  // ===========================
  // PROPRIÉTÉS DU COMPOSANT
  // ===========================
  
  /** Formulaire réactif d'inscription */
  registerForm: FormGroup;
  
  /** État de chargement pour désactiver le formulaire */
  isLoading = false;

  // ===========================
  // CONSTRUCTEUR ET INJECTION
  // ===========================
  
  /**
   * Constructeur du composant d'inscription
   * 
   * @param formBuilder - Service Angular pour créer des formulaires réactifs
   * @param router - Service de navigation Angular
   * @param authService - Service d'authentification MDD
   * @param errorService - Service de gestion d'erreurs centralisé (PUBLIC pour template)
   */
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public errorService: ErrorService  // ✅ PUBLIC pour accès dans le template
  ) {
    // Initialisation du formulaire à la construction
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]]
    });
  }

  // ===========================
  // CYCLE DE VIE ANGULAR
  // ===========================
  
  /**
   * Initialisation du composant
   * Aucune action spécifique nécessaire pour ce composant
   */
  ngOnInit(): void {
    // Formulaire déjà initialisé dans le constructeur
    console.log('📝 Composant Register initialisé');
  }

  // ===========================
  // VALIDATEURS PERSONNALISÉS
  // ===========================
  
  /**
   * Validateur personnalisé pour le mot de passe
   * 
   * Exigences selon spécifications MDD :
   * - Minimum 8 caractères
   * - Au moins une majuscule
   * - Au moins une minuscule  
   * - Au moins un chiffre
   * 
   * @param control - Contrôle du formulaire à valider
   * @returns null si valide, objet d'erreur sinon
   */
  passwordValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    // Vérifications selon spécifications
    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    // Retourne null si toutes les conditions sont remplies
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber ? null : { invalidPassword: true };
  }

  // ===========================
  // MÉTHODES DE VALIDATION FRONTEND
  // ===========================
  
  /**
   * Vérifie si un champ spécifique a une erreur et a été touché par l'utilisateur
   * 
   * Utilisée dans le template pour afficher conditionnellement les erreurs
   * et appliquer les styles d'erreur aux champs
   * 
   * @param fieldName - Nom du champ à vérifier ('username', 'email', 'password')
   * @returns true si le champ a une erreur et a été touché
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Récupère le message d'erreur approprié pour un champ donné
   * 
   * Fournit des messages d'erreur localisés et spécifiques selon le type
   * d'erreur de validation (required, email, minlength, etc.)
   * 
   * @param fieldName - Nom du champ pour lequel récupérer l'erreur
   * @returns Message d'erreur localisé ou chaîne vide si pas d'erreur
   */
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors && field.touched) {
      
      // Erreur de champ requis
      if (field.errors['required']) {
        const fieldNames: {[key: string]: string} = {
          'username': 'Nom d\'utilisateur',
          'email': 'Email',
          'password': 'Mot de passe'
        };
        return `${fieldNames[fieldName] || fieldName} requis`;
      }
      
      // Erreur de format email
      if (field.errors['email']) {
        return 'Format email invalide';
      }
      
      // Erreur de longueur minimale
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        if (fieldName === 'username') {
          return `Le nom d'utilisateur doit contenir au moins ${requiredLength} caractères`;
        }
        return `Ce champ doit contenir au moins ${requiredLength} caractères`;
      }
      
      // Erreur de validation de mot de passe personnalisée
      if (field.errors['invalidPassword']) {
        return 'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre';
      }
    }
    return '';
  }

  /**
   * Marque tous les champs du formulaire comme touchés
   * 
   * Force l'affichage des erreurs de validation sur tous les champs
   * Utilisée quand l'utilisateur tente de soumettre un formulaire invalide
   */
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  // ===========================
  // GESTION DE LA SOUMISSION
  // ===========================
  
  /**
   * Gère la soumission du formulaire d'inscription
   * 
   * Processus :
   * 1. Validation du formulaire côté client
   * 2. Préparation des données (trim des espaces)
   * 3. Appel API d'inscription via AuthService
   * 4. Gestion des réponses (succès/erreur) via ErrorService
   * 5. Navigation automatique vers login en cas de succès
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      // Début du processus d'inscription
      this.isLoading = true;
      this.errorService.clearAll();
      
      // Préparation des données avec nettoyage
      const registerData: RegisterRequest = {
        username: this.registerForm.value.username.trim(),
        email: this.registerForm.value.email.trim(),
        password: this.registerForm.value.password
      };
      
      // Appel API d'inscription
    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie:', response.message);
        
        // ✅ Connexion automatique après inscription réussie
        const loginData = {
          email: registerData.email,
          password: registerData.password
        };
        
        this.authService.login(loginData).subscribe({
          next: (loginResponse) => {
            this.isLoading = false;
            console.log('✅ Connexion automatique réussie');
            this.router.navigate(['/home']);
          },
          error: (loginError) => {
            this.isLoading = false;
            console.log('❌ Erreur connexion auto, redirection vers login');
            this.router.navigate(['/auth/login']);
          }
        });
      },
      error: (httpError: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorService.handleHttpError(httpError);
      }
    });
  } else {
    this.markFormGroupTouched();
  }
}

  // ===========================
  // MÉTHODES DE NAVIGATION
  // ===========================
  
  /**
   * Navigation vers la page de connexion
   * 
   * Utilisée par le lien "Déjà un compte ?" dans le template
   */
  goToLogin(): void {
    console.log('🔄 Navigation vers login depuis register');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigation vers la page d'accueil
   * 
   * Méthode de fallback si nécessaire
   */
  goToHome(): void {
    console.log('🔄 Navigation vers home depuis register');
    this.router.navigate(['/home']);
  }
}