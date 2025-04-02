import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../store/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSignup() {
    if (this.signupForm.valid) {
      try {
        const { email, password } = this.signupForm.value;
        await this.authService.signupWithEmail(email, password);
        const role = await firstValueFrom(this.authService.userRole$);
        this.router.navigate([role === 'admin' ? '/admin/dashboard' : '/visitor/my-visits']);
      } catch (error: any) {
        this.errorMessage = error.message;
      }
    }
  }

  async onGoogleSignup() {
    try {
      await this.authService.loginWithGoogle();
      const role = await firstValueFrom(this.authService.userRole$);
      this.router.navigate([role === 'admin' ? '/admin/dashboard' : '/visitor/my-visits']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}