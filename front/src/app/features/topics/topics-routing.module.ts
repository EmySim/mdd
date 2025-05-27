import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopicsListComponent } from './topics-list/topics-list.component';

const routes: Routes = [
  { path: '', component: TopicsListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicsRoutingModule { }
