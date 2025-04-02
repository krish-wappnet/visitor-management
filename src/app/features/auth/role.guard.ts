import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './store/auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const expectedRole = route.data['expectedRole'];
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const role = await firstValueFrom(this.authService.userRole$);
    if (role !== expectedRole) {
      this.router.navigate([role === 'admin' ? '/admin/dashboard' : '/visitor/my-visits']);
      return false;
    }
    return true;
  }
}