import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopicsRoutingModule } from './topics-routing.module';
import { TopicsListComponent } from './topics-list/topics-list.component';


@NgModule({
  declarations: [
    TopicsListComponent
  ],
  imports: [
    CommonModule,
    TopicsRoutingModule
  ]
})
export class TopicsModule { }
