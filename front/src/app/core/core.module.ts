import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule
  ]
})
export class CoreModule { }
