import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { ResponsiveLayoutComponent } from './responsive-layout/responsive-layout.component';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    ResponsiveLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule // Pour routerLink dans navbar
  ],
  exports: [
    NavbarComponent, // ← FIX pour app-navbar
    FooterComponent, // ← FIX pour app-footer
    ResponsiveLayoutComponent
  ]
})
export class CoreModule { }