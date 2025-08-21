import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select'; 
import { MatOptionModule } from '@angular/material/core'; 
import { LayoutModule } from '@angular/cdk/layout';

// Modules
import { AppRoutingModule } from './app-routing.module';

// Composants
import { AppComponent } from './app.component';
import { LandingComponent } from './pages/landing/landing.component';
import { ThemeComponent } from './features/themes/theme.component';
import { ArticleComponent } from './features/articles/article.component';
import { CreateArticleComponent } from './features/articles/create-article.component';
import { ProfileComponent } from './features/profile/profile.component';
import { CommentComponent } from './features/comments/comment.component'; 

// Shared
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
    LandingComponent,
    ThemeComponent,
    ArticleComponent,
    CreateArticleComponent,
    ProfileComponent,
    CommentComponent, 
    ErrorToastComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule, 
    RouterModule, 
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule, 
    FormsModule, 
    
    // Angular Material
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule, 
    MatOptionModule, 
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