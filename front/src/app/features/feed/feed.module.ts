import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeedRoutingModule } from './feed-routing.module';
import { FeedComponent } from './feed/feed.component';
import { FeedListComponent } from './feed-list/feed-list.component';
import { FeedItemComponent } from './feed-item/feed-item.component';


@NgModule({
  declarations: [
    FeedComponent,
    FeedListComponent,
    FeedItemComponent
  ],
  imports: [
    CommonModule,
    FeedRoutingModule
  ]
})
export class FeedModule { }
