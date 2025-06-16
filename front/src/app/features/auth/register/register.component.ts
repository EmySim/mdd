import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ErrorService } from '../../../core/error.service';
import { RegisterRequest } from '../interfaces/registerRequest.interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private errorService: ErrorService
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]]
    });
  }

  ngOnInit(): void {}

  passwordValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber ? null : { invalidPassword: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorService.clearAll();
      
      const registerData: RegisterRequest = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      
      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Inscription réussie:', response.message);
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorService.showError(error.message);
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}