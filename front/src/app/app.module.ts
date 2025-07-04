import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material
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
import { ArticleComponent } from './features/articles/article.component';
import { ProfileComponent } from './features/profile/profile.component';

// Composants réutilisables
import { ErrorToastComponent } from './components/error-toast/error-toast.component';
import { NavbarComponent } from './components/navbar/navbar.component';

// Services
import { AuthService } from './features/auth/auth.service';
import { ThemeService } from './features/themes/theme.service';
import { ProfileService } from './features/profile/profile.service';
import { ArticleService } from './features/articles/article.service';
import { CommentService } from './features/comments/comment.service';
import { ErrorService } from './services/error.service';

// Interceptor
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LandingComponent,
    ThemeComponent,
    ArticleComponent,
    ProfileComponent,
    ErrorToastComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule, 
    FormsModule, 
    CommonModule, 
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    LayoutModule,
  ],
  providers: [
    AuthService,
    ThemeService,
    ProfileService,
    ArticleService,
    CommentService,
    ErrorService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}