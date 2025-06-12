import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'register', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'feed', loadChildren: () => import('./features/feed/feed.module').then(m => m.FeedModule) },
  { path: 'topics', loadChildren: () => import('./features/topics/topics.module').then(m => m.TopicsModule) },
  { path: 'profile', loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule) },
  { path: 'post/:id', loadChildren: () => import('./features/posts/posts.module').then(m => m.PostsModule) },
  { path: 'new-post', loadChildren: () => import('./features/posts/posts.module').then(m => m.PostsModule) },
  { path: '**', redirectTo: '/feed' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }