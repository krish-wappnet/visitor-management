import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitorCheckinComponent } from './components/visitor-checkin/visitor-checkin.component';
import { VisitorComponent } from './visitor.component';

const routes: Routes = [
  { path: '', component: VisitorComponent }, // Default route for /visitor
  { path: 'checkin', component: VisitorCheckinComponent }, // Route for /visitor/checkin
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitorRoutingModule {}