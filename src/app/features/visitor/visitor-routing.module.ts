import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitorCheckinComponent } from './components/visitor-checkin/visitor-checkin.component';

const routes: Routes = [
  { path: '', component: VisitorCheckinComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitorRoutingModule {}