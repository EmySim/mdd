// src/app/app-routing.module.ts - ROUTING NETTOYÉ
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Pages principales
import { HomeComponent } from './pages/home/home.component';
import { LandingComponent } from './pages/landing/landing.component';

// Features - tous dans AppModule maintenant
import { ProfileComponent } from './features/profile/profile.component';
import { ArticleComponent } from './features/articles/article.component';
import { ThemeComponent } from './features/themes/theme.component';

// Guards
import { AuthGuard } from './features/auth/auth.guard';

/**
 * Configuration routing MDD - Architecture simplifiée
 * 
 * ✅ Toutes les routes principales ici
 * ✅ Seulement AuthModule en lazy loading
 * ✅ Routes cohérentes et simples
 */
const routes: Routes = [
  
  // ===========================
  // REDIRECTION PAR DÉFAUT
  // ===========================
  { 
    path: '', 
    redirectTo: '/landing', 
    pathMatch: 'full' 
  },

  // ===========================
  // PAGES PUBLIQUES
  // ===========================
  
  { 
    path: 'landing', 
    component: LandingComponent 
  },

  // ===========================
  // AUTHENTIFICATION
  // ===========================
  
  // Seul module en lazy loading (login + register)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // ===========================
  // PAGES PROTÉGÉES
  // ===========================
  
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [AuthGuard]
  },

  { 
    path: 'articles', 
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },

  { 
    path: 'themes', 
    component: ThemeComponent,
    canActivate: [AuthGuard]
  },
  
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },

  // ===========================
  // ROUTES FUTURES (à implémenter)
  // ===========================
  
  // Articles détaillés
  // { 
  //   path: 'articles/:id', 
  //   component: ArticleDetailComponent,
  //   canActivate: [AuthGuard]
  // },

  // Création d'article
  // { 
  //   path: 'articles/create', 
  //   component: CreateArticleComponent,
  //   canActivate: [AuthGuard]
  // },

  // ===========================
  // FALLBACK
  // ===========================
  
  { 
    path: '**', 
    redirectTo: '/landing' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  constructor() {
    console.log('🗺️ Routing configuré - Architecture simple');
  }
}