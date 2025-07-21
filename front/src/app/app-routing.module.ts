import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Pages principales
import { LandingComponent } from './pages/landing/landing.component';

// Features
import { ProfileComponent } from './features/profile/profile.component';
import { ArticleComponent } from './features/articles/article.component';
import { CreateArticleComponent } from './features/articles/create-article.component'; // ✅ AJOUTÉ
import { ThemeComponent } from './features/themes/theme.component';

// Guards
import { AuthGuard } from './features/auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },

  // Auth
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // Articles 
  { 
    path: 'articles/create', 
    component: CreateArticleComponent,
    canActivate: [AuthGuard]
  },
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

  // Autres
  { path: 'themes', component: ThemeComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }