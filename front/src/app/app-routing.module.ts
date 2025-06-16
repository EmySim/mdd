// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard, GuestGuard } from './features/auth/auth.guard';

/**
 * Configuration principale du routing de l'application MDD.
 * 
 * Architecture :
 * - /home : Landing page publique
 * - /auth/* : Routes d'authentification (login, register) avec lazy loading
 * - /feed : Fil d'actualité (protégé)
 * - /topics : Gestion des sujets (protégé)
 * - /profile : Profil utilisateur (protégé)
 * - /post/:id et /new-post : Gestion des articles (protégé)
 * 
 * Guards :
 * - AuthGuard : Protège les routes nécessitant une authentification
 * - GuestGuard : Empêche l'accès aux routes publiques si déjà connecté
 */

const routes: Routes = [
  // Redirige la racine vers /home
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Route pour la landing page
  { path: 'home', component: HomeComponent },

  // Routes publiques (avec GuestGuard pour éviter l'accès si déjà connecté)
  { 
    path: 'login', 
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },
  { 
    path: 'register', 
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },

  // Routes protégées (nécessitent une authentification)
  { 
    path: 'feed', 
    loadChildren: () => import('./features/feed/feed.module').then(m => m.FeedModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'topics', 
    loadChildren: () => import('./features/topics/topics.module').then(m => m.TopicsModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },

  // Routes pour les articles/posts
  { 
    path: 'post/:id', 
    loadChildren: () => import('./features/posts/posts.module').then(m => m.PostsModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'new-post', 
    loadChildren: () => import('./features/posts/posts.module').then(m => m.PostsModule),
    canActivate: [AuthGuard]
  },

  // Route de fallback - redirige vers /home
  { 
    path: '**', 
    redirectTo: '/home' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: true,
    preloadingStrategy: undefined,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }