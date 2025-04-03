// signup.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../store/auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUserStatus } from '../store/auth.selectores';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-signup',
  standalone:false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private store: Store<{ auth: any }>
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
        const status = await firstValueFrom(this.store.select(selectUserStatus));
        this.router.navigate([status === 'pending' ? '/pending' : '/visitor/my-visits']);
      } catch (error: any) {
        this.errorMessage = error.message;
      }
    }
  }

  async onGoogleSignup() {
    try {
      await this.authService.loginWithGoogle();
      const status = await firstValueFrom(this.store.select(selectUserStatus));
      this.router.navigate([status === 'pending' ? '/pending' : '/visitor/my-visits']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}