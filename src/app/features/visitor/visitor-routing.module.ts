import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitorCheckinComponent } from './components/visitor-checkin/visitor-checkin.component';
import { VisitorComponent } from './visitor.component';
import { MyVisitsComponent } from './components/my-visits/my-visits.component';
import { RoleGuard } from '../auth/role.guard';

const routes: Routes = [
  { path: '', component: VisitorComponent }, // Default route for /visitor
  { path: 'my-visits', component: MyVisitsComponent, canActivate: [RoleGuard], data: { expectedRole: 'visitor' } },
  { path: 'checkin', component: VisitorCheckinComponent }, // Route for /visitor/checkin
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitorRoutingModule {}