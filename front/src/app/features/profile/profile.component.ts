import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from './profile.service';
import { ThemeService } from '../themes/theme.service';
import { ErrorService } from '../../services/error.service';
// ✅ Import des interfaces typées
import { User } from '../auth/interfaces/auth.interface';
import { Theme } from '../../interfaces/theme.interface';
import { UpdateUserRequest } from '../../interfaces/user.interface';

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
  currentUser: User | null = null;  // ✅ Typé au lieu de any
  subscribedThemes: Theme[] = [];   // ✅ Typé au lieu de any[]
  
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
      password: [''] // Optionnel pour modification
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
    ).subscribe(user => {
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
      // ✅ CORRIGÉ - Paramètre typé explicitement
      next: (response: any) => {
        this.subscribedThemes = response.content?.filter((theme: Theme) => theme.isSubscribed) || [];
        this.isLoadingSubscriptions = false;
        console.log(`✅ ${this.subscribedThemes.length} abonnements chargés`);
      },
      // ✅ CORRIGÉ - Paramètre typé explicitement  
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
      
      // ✅ CORRIGÉ - Utilisation de la bonne méthode de service
      this.profileService.updateUserProfile(this.currentUser.id, updateData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        // ✅ CORRIGÉ - Paramètre typé explicitement
        next: (updatedUser: User) => {
          console.log('✅ Profil mis à jour avec succès');
          this.isSaving = false;
          this.currentUser = updatedUser;
          this.populateForm(updatedUser);
          
          // Mettre à jour les données dans AuthService
          this.authService.updateCurrentUser(updatedUser);
        },
        // ✅ CORRIGÉ - Paramètre typé explicitement
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
      // ✅ CORRIGÉ - Paramètre typé explicitement
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
        return `Le nom d'utilisateur doit contenir au moins 3 caractères`;
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
   * ✅ AJOUTÉ - TrackBy pour optimiser le rendu de la liste des thèmes
   * Méthode manquante qui était utilisée dans le template
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
}