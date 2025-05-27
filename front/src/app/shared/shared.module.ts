import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { ModalComponent } from './modal/modal.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ButtonComponent } from './button/button.component';

@NgModule({
  declarations: [
    NavbarComponent,
    ModalComponent,
    LoadingSpinnerComponent,
    ButtonComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NavbarComponent
  ]
})
export class SharedModule { }
