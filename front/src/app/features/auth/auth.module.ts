import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';  
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
 */
const authRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

/**
 * Module d'authentification pour l'application MDD.
 */
@NgModule({
  declarations: [
    LoginComponent,       
    RegisterComponent    
  ],
  imports: [
    // Angular Core
    CommonModule,
    HttpClientModule,
    
    // Routing intégré 
    RouterModule.forChild(authRoutes),  
    
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