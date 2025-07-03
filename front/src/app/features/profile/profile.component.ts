// ============================================================================
// PROFILE COMPONENT - IMPORTS CORRIGÉS
// src/app/features/profile/profile.component.ts
// ============================================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from './profile.service';
import { ThemeService } from '../themes/theme.service';
import { ErrorService } from '../../services/error.service';
// ✅ Import depuis les interfaces existantes
import { User } from '../auth/interfaces/auth.interface';
import { UpdateUserRequest } from '../../interfaces/user.interface';
import { Theme } from '../../interfaces/theme.interface';

/**
 * Composant de profil utilisateur - Simple pour MVP
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  
  // ===========================
  // PROPRIÉTÉS
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // CHARGEMENT DES DONNÉES
  // ===========================
  
  private loadCurrentUser(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserProfile(user.id);
      }
    });
  }

  private loadUserProfile(userId: number): void {
    this.isLoading = true;
    this.errorService.clearAll();
    
    this.profileService.getUserProfile(userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user: User) => {
        this.currentUser = user;
        this.populateForm(user);
        this.loadUserSubscriptions();
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('❌ Erreur chargement profil:', error);
      }
    });
  }

  private loadUserSubscriptions(): void {
    this.isLoadingSubscriptions = true;
    
    this.themeService.getAllThemes(0, 1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.subscribedThemes = response.content.filter(theme => theme.isSubscribed);
        this.isLoadingSubscriptions = false;
      },
      error: (error) => {
        this.isLoadingSubscriptions = false;
        console.error('❌ Erreur chargement abonnements:', error);
      }
    });
  }

  // ===========================
  // FORMULAIRE
  // ===========================
  
  private createProfileForm(): FormGroup {
    return this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''] // Optionnel
    });
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      username: user.username,
      email: user.email,
      password: ''
    });
  }

  // ===========================
  // SAUVEGARDE
  // ===========================
  
  onSaveProfile(): void {
    if (this.profileForm.valid && !this.isSaving && this.currentUser) {
      this.isSaving = true;
      this.errorService.clearAll();

      const updateData: UpdateUserRequest = {
        username: this.profileForm.value.username.trim(),
        email: this.profileForm.value.email.trim()
      };

      const password = this.profileForm.value.password;
      if (password && password.trim()) {
        updateData.password = password.trim();
      }

      this.profileService.updateUserProfile(this.currentUser.id, updateData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (updatedUser: User) => {
          this.isSaving = false;
          this.currentUser = updatedUser;
          this.populateForm(updatedUser);
          console.log('✅ Profil sauvegardé');
        },
        error: (error: HttpErrorResponse) => {
          this.isSaving = false;
          console.error('❌ Erreur sauvegarde profil:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // ===========================
  // ABONNEMENTS
  // ===========================
  
  unsubscribeFromTheme(theme: Theme): void {
    this.themeService.unsubscribeFromTheme(theme.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.subscribedThemes = this.subscribedThemes.filter(t => t.id !== theme.id);
        console.log(`✅ Désabonné de: ${theme.name}`);
      },
      error: (error) => {
        console.error('❌ Erreur désabonnement:', error);
      }
    });
  }

  // ===========================
  // VALIDATION
  // ===========================
  
  hasFieldError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

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

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });
  }

  trackByThemeId(index: number, theme: Theme): number {
    return theme.id;
  }
}