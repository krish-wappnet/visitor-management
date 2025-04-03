// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './store/auth.service';
import { firstValueFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserRole, selectUserStatus } from '../auth/store/auth.selectores'; // Fixed typo: 'selectores' -> 'selectors'

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store<{ auth: any }>
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const expectedRole = route.data['expectedRole'];
    console.log('RoleGuard - Checking route:', route.routeConfig?.path, 'Expected role:', expectedRole);

    // Check if the user is authenticated
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.log('No authenticated user, redirecting to /login');
      this.router.navigate(['/login']);
      return false;
    }

    // Get role and status
    const role = await firstValueFrom(this.authService.userRole$);
    const status = await firstValueFrom(this.store.select(selectUserStatus));
    console.log('RoleGuard - User:', user.email, 'Role:', role, 'Status:', status);

    // If user is not approved, redirect to pending page
    if (status !== 'approved') {
      console.log('Status not approved, redirecting to /pending');
      this.router.navigate(['/pending']);
      return false;
    }

    // Check if the role matches the expected role
    if (role !== expectedRole) {
      const redirectPath = role === 'admin' ? '/admin/dashboard' : '/visitor/my-visits';
      console.log('Role mismatch, redirecting to:', redirectPath);
      this.router.navigate([redirectPath]).then(success => {
        console.log('Redirect success:', success);
      });
      return false;
    }

    console.log('Access granted to:', route.routeConfig?.path);
    return true;
  }
}