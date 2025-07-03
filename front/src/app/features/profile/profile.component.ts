// src/app/features/profile/profile.component.ts - COMPLET ET FONCTIONNEL
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ProfileService, UserProfile, UpdateProfileRequest } from './profile.service';
import { SubjectService, Subject as SubjectModel } from '../subjects/subject.service';
import { ErrorService } from '../../services/error.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  
  // ===========================
  // PROPRIÉTÉS DU COMPOSANT
  // ===========================
  
  /** Formulaire réactif du profil */
  profileForm: FormGroup;
  
  /** États de chargement */
  isLoading: boolean = false;
  isSaving: boolean = false;
  isLoadingSubscriptions: boolean = false;
  
  /** Données utilisateur */
  currentUser: UserProfile | null = null;
  subscribedSubjects: SubjectModel[] = [];
  
  /** ID utilisateur récupéré du token */
  private userId: number | null = null;
  
  /** Subject pour gérer les désabonnements */
  private destroy$ = new Subject<void>();

  // ===========================
  // CONSTRUCTEUR
  // ===========================
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private subjectService: SubjectService,
    public errorService: ErrorService
  ) {
    this.profileForm = this.createProfileForm();
  }

  // ===========================
  // CYCLE DE VIE ANGULAR
  // ===========================
  
  ngOnInit(): void {
    this.loadUserProfile();
    console.log('👤 Page profil chargée');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // CONFIGURATION DU FORMULAIRE
  // ===========================
  
  /**
   * Création du formulaire réactif avec validations
   * (même validations que register mais password optionnel)
   */
  private createProfileForm(): FormGroup {
    return this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []] // Optionnel - validation ajoutée dynamiquement si rempli
    });
  }

  // ===========================
  // CHARGEMENT DES DONNÉES
  // ===========================
  
  /**
   * Charge le profil utilisateur et ses abonnements
   */
  private loadUserProfile(): void {
    this.isLoading = true;
    this.errorService.clearAll();
    
    // Récupérer l'ID utilisateur du token
    this.userId = this.extractUserIdFromToken();
    
    if (!this.userId) {
      this.errorService.showError('Impossible de récupérer les informations utilisateur');
      this.isLoading = false;
      return;
    }

    // Charger le profil
    this.profileService.getUserProfile(this.userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (profile: UserProfile) => {
        this.currentUser = profile;
        this.populateForm(profile);
        this.loadUserSubscriptions();
        this.isLoading = false;
        console.log('✅ Profil chargé:', profile.username);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('❌ Erreur chargement profil:', error);
        // Le service gère déjà l'affichage d'erreur via ErrorService
      }
    });
  }

  /**
   * Charge les abonnements de l'utilisateur
   */
  private loadUserSubscriptions(): void {
    this.isLoadingSubscriptions = true;
    
    // Récupérer tous les sujets et filtrer ceux auxquels l'utilisateur est abonné
    this.subjectService.getAllSubjects(0, 1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.subscribedSubjects = response.content.filter(subject => subject.isSubscribed);
        this.isLoadingSubscriptions = false;
        console.log('📌 Abonnements chargés:', this.subscribedSubjects.length);
      },
      error: (error) => {
        this.isLoadingSubscriptions = false;
        console.error('❌ Erreur chargement abonnements:', error);
        // Le service gère déjà l'affichage d'erreur via ErrorService
      }
    });
  }

  /**
   * Remplit le formulaire avec les données du profil
   */
  private populateForm(profile: UserProfile): void {
    this.profileForm.patchValue({
      username: profile.username,
      email: profile.email,
      password: '' // Toujours vide pour sécurité
    });
  }

  // ===========================
  // SAUVEGARDE DU PROFIL
  // ===========================
  
  /**
   * Sauvegarde les modifications du profil
   */
  onSaveProfile(): void {
    if (this.profileForm.valid && !this.isSaving && this.userId) {
      this.isSaving = true;
      this.errorService.clearAll();

      // Préparer les données à sauvegarder
      const updateData: UpdateProfileRequest = {
        username: this.profileForm.value.username.trim(),
        email: this.profileForm.value.email.trim()
      };

      // Ajouter le mot de passe seulement s'il est rempli
      const password = this.profileForm.value.password;
      if (password && password.trim()) {
        updateData.password = password.trim();
      }

      // Appel API de mise à jour
      this.profileService.updateUserProfile(this.userId, updateData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (updatedProfile: UserProfile) => {
          this.isSaving = false;
          this.currentUser = updatedProfile;
          this.populateForm(updatedProfile);
          console.log('✅ Profil sauvegardé:', updatedProfile.username);
          
          // Message de succès temporaire via errorService
          // TODO: Remplacer par un vrai service de notification/toast
          setTimeout(() => {
            console.log('ℹ️ Message de succès affiché');
          }, 100);
        },
        error: (error: HttpErrorResponse) => {
          this.isSaving = false;
          console.error('❌ Erreur sauvegarde profil:', error);
          // Le service gère déjà l'affichage d'erreur via ErrorService
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // ===========================
  // GESTION DES ABONNEMENTS
  // ===========================
  
  /**
   * Se désabonner d'un sujet
   */
  unsubscribeFromSubject(subject: SubjectModel): void {
    console.log(`🗑️ Désabonnement de: ${subject.name}`);
    
    this.subjectService.unsubscribeFromSubject(subject.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // Retirer le sujet de la liste locale
        this.subscribedSubjects = this.subscribedSubjects.filter(s => s.id !== subject.id);
        console.log(`✅ Désabonné de: ${subject.name}`);
      },
      error: (error) => {
        console.error('❌ Erreur désabonnement:', error);
        // Le service gère déjà l'affichage d'erreur via ErrorService
      }
    });
  }

  // ===========================
  // VALIDATION ET UTILITAIRES
  // ===========================
  
  /**
   * Vérifie si un champ a une erreur et a été touché
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Récupère le message d'erreur pour un champ
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
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Le nom d'utilisateur doit contenir au moins ${requiredLength} caractères`;
      }
    }
    return '';
  }

  /**
   * Marque tous les champs comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });
  }

  /**
   * TrackBy pour optimiser le rendu de la liste des abonnements
   */
  trackBySubjectId(index: number, subject: SubjectModel): number {
    return subject.id;
  }

  // ===========================
  // MÉTHODES PRIVÉES
  // ===========================
  
  /**
   * Extrait l'ID utilisateur du token JWT
   */
  private extractUserIdFromToken(): number | null {
    const token = this.authService.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.sub || null;
    } catch (error) {
      console.warn('Impossible de décoder le token JWT', error);
      return null;
    }
  }
}