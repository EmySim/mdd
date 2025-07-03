// src/app/app-routing.module.ts 
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Pages principales
import { HomeComponent } from './pages/home/home.component';
import { LandingComponent } from './pages/landing/landing.component';

// Features 
import { ProfileComponent } from './features/profile/profile.component';
import { ArticleComponent } from './features/articles/article.component';
import { SubjectComponent } from './features/subjects/subject.component';

// Guards
import { AuthGuard } from './features/auth/auth.guard';

/**
 * Configuration routing MDD
 * Note : Lazy loading seulement pour auth (plus complexe)
 */

const routes: Routes = [
  
  // ===========================
  // REDIRECTION
  // ===========================
  { 
    path: '', 
    redirectTo: '/landing', 
    pathMatch: 'full' 
  },

  // ===========================
  // PAGES PRINCIPALES
  // ===========================
  
  { 
    path: 'landing', 
    component: LandingComponent 
  },

  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [AuthGuard]
  },

  // ===========================
  // FEATURES SIMPLES
  // ===========================
  
  // Authentification (garde le lazy loading car plus complexe : login + register)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // Autres features : DIRECT (simples, 1 composant chacune)
  { 
    path: 'themes', 
    component: SubjectComponent,
    canActivate: [AuthGuard]
  },
  
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },

  { 
    path: 'articles', 
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },

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