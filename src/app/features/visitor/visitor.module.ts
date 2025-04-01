import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // For ngModel in check-out form
import { VisitorRoutingModule } from './visitor-routing.module';
import { VisitorCheckinComponent } from './components/visitor-checkin/visitor-checkin.component';
import { SharedModule } from '../../shared/shared.module'; // Import SharedModule

@NgModule({
  declarations: [],
  imports: [
    VisitorCheckinComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // Add this for ngModel in the check-out form
    VisitorRoutingModule,
    SharedModule, // This brings in VisitorFormComponent and QrCodeGeneratorComponent
  ],
})
export class VisitorModule {}