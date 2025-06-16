import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Routing et composants
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

/**
 * Module d'authentification pour l'application MDD.
 * 
 * Ce module encapsule toutes les fonctionnalités liées à l'authentification :
 * - Composants de connexion et d'inscription
 * - Services d'authentification
 * - Guards de protection des routes
 * - Formulaires réactifs avec validation
 * - Interface Material Design
 * 
 * Utilise le lazy loading pour optimiser les performances.
 */
@NgModule({
  declarations: [
    LoginComponent,       // Composant de connexion (/auth/login)
    RegisterComponent     // Composant d'inscription (/auth/register)
  ],
  imports: [
    // Angular Core
    CommonModule,
    HttpClientModule,
    
    // Routing
    AuthRoutingModule,
    
    // Formulaires réactifs
    ReactiveFormsModule,
    FormsModule,
    
    // Angular Material UI Components
    MatButtonModule,           // Boutons Material
    MatInputModule,            // Champs de saisie
    MatFormFieldModule,        // Conteneurs de formulaire
    MatCardModule,             // Cartes pour layout
    MatIconModule,             // Icônes Material
    MatProgressSpinnerModule,  // Indicateurs de chargement
    MatSnackBarModule          // Notifications toast
  ],
  providers: [
    // Les services sont déclarés avec providedIn: 'root' 
    // donc pas besoin de les déclarer ici
    // AuthService, AuthGuard, GuestGuard sont automatiquement disponibles
  ]
})
export class AuthModule { 

  constructor() {
    console.log('🔐 AuthModule initialisé - Composants d\'authentification chargés');
  }
}