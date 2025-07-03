// src/app/features/profile/profile.module.ts - AVEC TOUTES LES DÉPENDANCES
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Composants
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [
    ProfileComponent
  ],
  imports: [
    // Angular Core
    CommonModule,
    RouterModule,
    
    // Formulaires réactifs
    ReactiveFormsModule,
    FormsModule,
    
    // Angular Material
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  exports: [
    ProfileComponent
  ]
})
export class ProfileModule { }