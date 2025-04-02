import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../store/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false, // Changed to true
  // imports: [CommonModule, ReactiveFormsModule], // Added for standalone
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
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
        const role = await firstValueFrom(this.authService.userRole$);
        this.router.navigate([role === 'admin' ? '/admin/dashboard' : '/visitor/my-visits']);
      } catch (error: any) {
        this.errorMessage = error.message;
      }
    }
  }

  async onGoogleLogin() {
    try {
      await this.authService.loginWithGoogle();
      const role = await firstValueFrom(this.authService.userRole$);
      this.router.navigate([role === 'admin' ? '/admin/dashboard' : '/visitor/my-visits']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}