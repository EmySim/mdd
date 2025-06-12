// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './features/auth/auth.guard';

const routes: Routes = [
  // Route par défaut - redirige vers le feed si connecté, sinon vers home
  { 
    path: '', 
    redirectTo: '/feed', 
    pathMatch: 'full' 
  },

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

  // Route de fallback - redirige vers feed
  { 
    path: '**', 
    redirectTo: '/feed' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Options de routage pour l'optimisation
    enableTracing: false, // Mettre à true pour déboguer le routage
    preloadingStrategy: undefined, // Pas de preloading pour le MVP
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }