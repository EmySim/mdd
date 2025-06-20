// src/app/app.module.ts - VERSION ULTRA-SIMPLE
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material minimal
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LayoutModule } from '@angular/cdk/layout';

// Modules de l'application
import { AppRoutingModule } from './app-routing.module';

// Composants
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { LandingComponent } from './pages/landing/landing.component';
import { ThemeComponent } from './features/themes/theme.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ArticleComponent } from './features/articles/article.component';

// Composants réutilisables
import { ErrorToastComponent } from './components/error-toast/error-toast.component';
import { NavbarComponent } from './components/navbar/navbar.component';

// Services globaux
import { ThemeService } from './features/themes/theme.service';
import { ProfileService } from './features/profile/profile.service';
import { ArticleService } from './features/articles/article.service';

// Interceptor
import { JwtInterceptor } from './interceptors/jwt.interceptor';

/**
 * Module racine
 *
 * ✅ Tous les composants principaux déclarés ici
 * ✅ Tous les services fournis ici
 * ✅ Seulement AuthModule en lazy loading (plus complexe)
 *
 * Avantage : Simple, tout au même endroit
 * Inconvénient : Bundle plus gros (mais OK pour MVP)
 */
@NgModule({
  declarations: [
    // Composant racine
    AppComponent,

    // Pages principales
    HomeComponent,
    LandingComponent,

    // Features
    ThemeComponent,
    ProfileComponent,
    ArticleComponent,

    // Composants réutilisables
    ErrorToastComponent,
    NavbarComponent,

    // Auth reste en lazy loading → pas déclaré ici
  ],
  imports: [
    // Modules Angular essentiels
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,

    // Angular Material pour MVP
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    LayoutModule,
  ],
  providers: [
    // Services des features
    ThemeService,
    ProfileService,
    ArticleService,

    // Interceptor JWT
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
