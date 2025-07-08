import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from './profile.service';
import { ThemeService } from '../themes/theme.service';
import { ErrorService } from '../../services/error.service';
// ✅ CORRIGÉ - Import des interfaces centralisées
import { User, UpdateUserRequest } from '../../interfaces/user.interface';
import { Theme, ThemesPage } from '../../interfaces/theme.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  
  // ===========================
  // PROPRIÉTÉS TYPÉES
  // ===========================
  
  profileForm: FormGroup;
  currentUser: User | null = null;
  subscribedThemes: Theme[] = [];
  
  // États de chargement
  isLoading = false;
  isSaving = false;
  isLoadingSubscriptions = false;
  
  private destroy$ = new Subject<void>();

  // ===========================
  // CONSTRUCTEUR
  // ===========================
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private themeService: ThemeService,
    public errorService: ErrorService
  ) {
    this.profileForm = this.createProfileForm();
  }

  // ===========================
  // CYCLE DE VIE
  // ===========================
  
  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // FORMULAIRE
  // ===========================
  
  private createProfileForm(): FormGroup {
    return this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]] // Optionnel pour modification
    });
  }

  // ===========================
  // CHARGEMENT DES DONNÉES
  // ===========================
  
  /**
   * Charge les informations utilisateur depuis AuthService
   */
  private loadCurrentUser(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.populateForm(user);
      }
    });
  }

  /**
   * Remplit le formulaire avec les données utilisateur
   */
  private populateForm(user: User): void {
    this.profileForm.patchValue({
      username: user.username,
      email: user.email,
      password: ''
    });
  }

  /**
   * Charge les thèmes auxquels l'utilisateur est abonné
   */
  private loadSubscriptions(): void {
    this.isLoadingSubscriptions = true;
    
    this.themeService.getAllThemes(0, 1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ThemesPage) => {  // ✅ CORRIGÉ - Type correct
        this.subscribedThemes = response.content?.filter((theme: Theme) => theme.isSubscribed) || [];
        this.isLoadingSubscriptions = false;
        console.log(`✅ ${this.subscribedThemes.length} abonnements chargés`);
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur chargement abonnements:', error);
        this.isLoadingSubscriptions = false;
      }
    });
  }

  // ===========================
  // SAUVEGARDE PROFIL
  // ===========================
  
  /**
   * Sauvegarde les modifications du profil utilisateur
   */
  onSaveProfile(): void {
    if (this.profileForm.valid && !this.isSaving && this.currentUser) {
      this.isSaving = true;
      this.errorService.clearAll();
      
      const updateData: UpdateUserRequest = {
        username: this.profileForm.value.username.trim(),
        email: this.profileForm.value.email.trim()
      };
      
      // Ajouter le mot de passe seulement s'il est fourni
      const password = this.profileForm.value.password;
      if (password && password.trim()) {
        updateData.password = password.trim();
      }
      
      // Appel au service de profil
      this.profileService.updateUserProfile(this.currentUser.id, updateData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (updatedUser: User) => {
          console.log('✅ Profil mis à jour avec succès');
          this.isSaving = false;
          this.currentUser = updatedUser;
          this.populateForm(updatedUser);
          
          // Mettre à jour les données dans AuthService
          this.authService.updateCurrentUser(updatedUser);
        },
        error: (error: HttpErrorResponse) => {
          console.error('❌ Erreur mise à jour profil:', error);
          this.isSaving = false;
          this.errorService.handleHttpError(error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // ===========================
  // GESTION ABONNEMENTS
  // ===========================
  
  /**
   * Se désabonne d'un thème
   */
  unsubscribeFromTheme(theme: Theme): void {
    this.themeService.unsubscribeFromTheme(theme.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        console.log(`✅ Désabonné du thème: ${theme.name}`);
        // Retirer le thème de la liste locale (optimistic update)
        this.subscribedThemes = this.subscribedThemes.filter(t => t.id !== theme.id);
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur désabonnement:', error);
        this.errorService.handleHttpError(error);
      }
    });
  }

  // ===========================
  // VALIDATION FORMULAIRE
  // ===========================
  
  /**
   * Vérifie si un champ a une erreur
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Retourne le message d'erreur d'un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && field.touched) {
      
      if (field.errors['required']) {
        const fieldNames: {[key: string]: string} = {
          'username': 'Nom d\'utilisateur',
          'email': 'Email'
        };
        return `${fieldNames[fieldName] || fieldName} requis`;
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
   * Marque tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });
  }

  // ===========================
  // MÉTHODES UTILITAIRES
  // ===========================
  
  /**
   * TrackBy pour optimiser le rendu de la liste des thèmes
   */
  trackByThemeId(index: number, theme: Theme): number {
    return theme.id;
  }

  /**
   * Refresh la liste des abonnements
   */
  refreshSubscriptions(): void {
    this.loadSubscriptions();
  }

  /**
   * Détermine si le formulaire est valide
   */
  get isFormValid(): boolean {
    return this.profileForm.valid;
  }

  /**
   * Retourne le nombre total d'abonnements
   */
  get subscriptionsCount(): number {
    return this.subscribedThemes.length;
  }

  /**
   * Détermine si on doit afficher le message d'absence d'abonnements
   */
  get hasNoSubscriptions(): boolean {
    return !this.isLoadingSubscriptions && this.subscribedThemes.length === 0;
  }
}