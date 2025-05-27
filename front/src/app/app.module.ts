import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { SharedModule } from './shared/shared.module';
import { ArticleViewComponent } from './articles/article-view/article-view.component';
import { ArticleFormComponent } from './articles/article-form/article-form.component';
import { CommentListComponent } from './comments/comment-list/comment-list.component';
import { CommentFormComponent } from './comments/comment-form/comment-form.component';
import { ThemeListComponent } from './themes/theme-list/theme-list.component';
import { ThemeItemComponent } from './themes/theme-item/theme-item.component';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { MockDataService } from './mock-data';

@NgModule({
  declarations: [AppComponent, HomeComponent, ArticleViewComponent, ArticleFormComponent, CommentListComponent, CommentFormComponent, ThemeListComponent, ThemeItemComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    SharedModule,
    HttpClientInMemoryWebApiModule.forRoot(MockDataService, { dataEncapsulation: false })
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
