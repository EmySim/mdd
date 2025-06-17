// src/app/features/auth/auth.module.ts - ROUTING INTÉGRÉ
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';  // ← Ajouté
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

// Composants
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

/**
 * Routing interne du module Auth
 * Simplifié : pas besoin de fichier séparé pour 2 routes
 */
const authRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

/**
 * Module d'authentification pour l'application MDD.
 * 
 * Version simplifiée avec routing intégré directement dans le module.
 * Plus besoin de auth-routing.module.ts séparé !
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
    
    // Routing intégré ✅
    RouterModule.forChild(authRoutes),  // ← Plus besoin de AuthRoutingModule !
    
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
  ]
})
export class AuthModule { 

  constructor() {
    console.log('🔐 AuthModule initialisé - Routing intégré');
  }
}