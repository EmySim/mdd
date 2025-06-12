import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalComponent } from './modal/modal.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ButtonComponent } from './button/button.component';
import { ErrorToastComponent } from './error-toast/error-toast.component';

@NgModule({
  declarations: [
    ModalComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    ErrorToastComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ModalComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    ErrorToastComponent // ← FIX pour app-error-toast
  ]
})
export class SharedModule { }