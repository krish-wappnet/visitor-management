import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../store/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onEmailLogin() {
    if (this.loginForm.valid) {
      try {
        const { email, password } = this.loginForm.value;
        await this.authService.loginWithEmail(email, password);
        this.router.navigate(['/visitor']);
      } catch (error: any) {
        this.errorMessage = error.message;
      }
    }
  }

  async onGoogleLogin() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/visitor']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}