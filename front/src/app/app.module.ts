import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

// Composants spécifiques à AppModule
import { ArticleViewComponent } from './features/articles/article-view/article-view.component';
import { ArticleFormComponent } from './features/articles/article-form/article-form.component';
import { CommentListComponent } from './features/comments/comment-list/comment-list.component';
import { CommentFormComponent } from './features/comments/comment-form/comment-form.component';
import { ThemeListComponent } from './themes/theme-list/theme-list.component';
import { ThemeItemComponent } from './themes/theme-item/theme-item.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ArticleViewComponent,
    ArticleFormComponent,
    CommentListComponent,
    CommentFormComponent,
    ThemeListComponent,
    ThemeItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule, 
    AppRoutingModule,
    HttpClientModule, 
    MatButtonModule,
    CoreModule, 
    SharedModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }