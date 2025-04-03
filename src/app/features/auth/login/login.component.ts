// login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../store/auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { selectUserRole, selectUserStatus } from '../store/auth.selectores';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private store: Store<{ auth: any }>
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
        console.log('Attempting login with:', email, password);
        await this.authService.loginWithEmail(email, password);

        const role = await firstValueFrom(this.store.select(selectUserRole));
        const status = await firstValueFrom(this.store.select(selectUserStatus));
        console.log('Role:', role, 'Status:', status);

        if (status === 'approved') {
          if (role === 'admin') {
            console.log('Redirecting to /admin/dashboard');
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'visitor') {
            console.log('Redirecting to /visitor/my-visits');
            this.router.navigate(['/visitor/my-visits']);
          } else {
            console.log('Unexpected role, redirecting to /login');
            this.router.navigate(['/login']);
          }
        } else {
          console.log('User not approved, redirecting to /pending');
          this.router.navigate(['/pending']);
        }
      } catch (error: any) {
        console.error('Login failed:', error);
        this.errorMessage = error.message;
      }
    }
  }

  async onGoogleLogin() {
    try {
      console.log('Attempting Google login');
      await this.authService.loginWithGoogle();

      const role = await firstValueFrom(this.store.select(selectUserRole));
      const status = await firstValueFrom(this.store.select(selectUserStatus));
      console.log('Role:', role, 'Status:', status);

      if (status === 'approved') {
        if (role === 'admin') {
          console.log('Redirecting to /admin/dashboard');
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'visitor') {
          console.log('Redirecting to /visitor/my-visits');
          this.router.navigate(['/visitor/my-visits']);
        } else {
          console.log('Unexpected role, redirecting to /login');
          this.router.navigate(['/login']);
        }
      } else {
        console.log('User not approved, redirecting to /pending');
        this.router.navigate(['/pending']);
      }
    } catch (error: any) {
      console.error('Google login failed:', error);
      this.errorMessage = error.message;
    }
  }
}