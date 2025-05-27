import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';


@NgModule({
  declarations: [
    ProfileComponent,
    ProfileViewComponent,
    ProfileEditComponent,
    SubscriptionListComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule { }
