import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'visitor', loadChildren: () => import('./features/visitor/visitor.module').then(m => m.VisitorModule) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: '', redirectTo: '/visitor', pathMatch: 'full' },
  { path: '**', redirectTo: '/visitor' }
];
