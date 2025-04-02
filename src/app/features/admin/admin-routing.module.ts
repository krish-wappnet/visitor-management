import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { RoleGuard } from '../auth/role.guard';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';

const routes: Routes = [
  { path: 'dashboard', component: AdminDashboardComponent, canActivate: [RoleGuard], data: { expectedRole: 'admin' } },
  { path: 'users', component: AdminUsersComponent, canActivate: [RoleGuard], data: { expectedRole: 'admin' } },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}