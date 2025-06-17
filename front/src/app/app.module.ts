// src/app/app.module.ts - VERSION AVEC INTERCEPTOR
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

// Modules de l'application
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

// Composants principaux
import { HomeComponent } from './pages/home/home.component';

// ✨ Interceptor JWT
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    // Modules Angular essentiels
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,

    // Angular Material modules (minimum MVP)
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,

    // Modules de l'application
    SharedModule,
    CoreModule
  ],
  providers: [
    // ✨ Interceptor JWT pour gestion automatique des erreurs
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }