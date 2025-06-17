// src/app/app-routing.module.ts - VERSION SIMPLIFIÉE
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LandingComponent } from './pages/landing/landing.component';
import { AuthGuard } from './features/auth/auth.guard';

/**
 * Configuration routing MDD - Approche simple et efficace
 * 
 * Principe : Un seul guard (AuthGuard) + logique conditionnelle dans les composants
 * 
 * Routes :
 * - /landing : Page publique
 * - /home : Fil d'actualité (protégé)
 * - /auth/* : Authentification (logique de redirection dans les composants)
 * - Features protégées avec AuthGuard
 */

const routes: Routes = [
  
  // ===========================
  // REDIRECTION SIMPLE
  // ===========================
  { 
    path: '', 
    redirectTo: '/landing', 
    pathMatch: 'full' 
  },

  // ===========================
  // PAGES PRINCIPALES
  // ===========================
  
  // Page publique
  { 
    path: 'landing', 
    component: LandingComponent 
  },

  // Fil d'actualité (protégé)
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [AuthGuard]
  },

  // ===========================
  // AUTHENTIFICATION (sans guard)
  // ===========================
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
    // Pas de GuestGuard → logique dans les composants login/register
  },

  // ===========================
  // FEATURES PROTÉGÉES
  // ===========================
  
  { 
    path: 'themes', 
    loadChildren: () => import('./features/themes/themes.module').then(m => m.ThemesModule),
    canActivate: [AuthGuard]
  },
  
  { 
    path: 'profile', 
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },

  { 
    path: 'articles', 
    loadChildren: () => import('./features/articles/articles.module').then(m => m.ArticlesModule),
    canActivate: [AuthGuard]
  },

  // ===========================
  // COMPATIBILITÉ
  // ===========================
  { path: 'post/:id', redirectTo: 'articles/:id' },
  { path: 'new-post', redirectTo: 'articles/create' },

  // ===========================
  // FALLBACK
  // ===========================
  { path: '**', redirectTo: '/landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }