// pending.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../store/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending',
  standalone:false,
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss'],
})
export class PendingComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Logout failed:', error);
    });
  }
}