// src/app/app.module.ts - VERSION SIMPLIFIÉE ET CORRIGÉE
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material (minimum MVP)
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

// Modules de l'application
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Composants globaux (si vous en avez)
// Note : Les pages (Landing/Home) sont maintenant en lazy loading

// Interceptor JWT
import { JwtInterceptor } from './interceptors/jwt.interceptor';

/**
 * Module racine de l'application MDD
 * 
 * Configuration :
 * ✅ Modules essentiels (Browser, HTTP, Routing)
 * ✅ Angular Material minimal pour MVP
 * ✅ Interceptor JWT pour authentification
 * ✅ Lazy loading des pages (Landing/Home dans leurs modules)
 * 
 * Note : Structure simplifiée sans Core/Shared modules
 */
@NgModule({
  declarations: [
    AppComponent
    // ✅ PLUS de composants pages ici → Lazy loading !
    // HomeComponent et LandingComponent sont dans leurs modules respectifs
  ],
  imports: [
    // ===========================
    // MODULES ANGULAR ESSENTIELS
    // ===========================
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,

    // ===========================
    // ANGULAR MATERIAL (MVP)
    // ===========================
    MatButtonModule,
    MatToolbarModule,
    MatIconModule

    // ✅ PLUS de SharedModule/CoreModule → Structure simplifiée
  ],
  providers: [
    // ===========================
    // INTERCEPTORS
    // ===========================
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }