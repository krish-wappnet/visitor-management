import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { VisitorRoutingModule } from './visitor-routing.module';
import { VisitorCheckinComponent } from './components/visitor-checkin/visitor-checkin.component';
import { SharedModule } from '../../shared/shared.module';
import { VisitorComponent } from './visitor.component';

@NgModule({
  declarations: [
    VisitorComponent,
    VisitorCheckinComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    VisitorRoutingModule,
    SharedModule,
  ],
})
export class VisitorModule {}