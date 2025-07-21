// front/src/app/app-routing.module.ts - AJOUT ROUTE DÉTAIL UNIQUEMENT
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Pages principales
import { LandingComponent } from './pages/landing/landing.component';

// Features - tous dans AppModule maintenant
import { ProfileComponent } from './features/profile/profile.component';
import { ArticleComponent } from './features/articles/article.component';
import { ThemeComponent } from './features/themes/theme.component';

// Guards
import { AuthGuard } from './features/auth/auth.guard';

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
    path: 'articles', 
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },

  { 
    path: 'articles/:id', 
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
    console.log('🗺️ Routing configuré - Route détail article ajoutée');
  }
}