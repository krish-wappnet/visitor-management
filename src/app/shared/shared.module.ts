import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { VisitorFormComponent } from './components/visitor-form/visitor-form.component';
import { QrCodeGeneratorComponent } from './components/qr-code-generator/qr-code-generator.component';
import { VisitorListComponent } from './components/visitor-list/visitor-list.component';

@NgModule({
  imports: [
    VisitorFormComponent,
    QrCodeGeneratorComponent,
    VisitorListComponent,
    CommonModule,
    ReactiveFormsModule,
  ],
  exports: [
    VisitorFormComponent,
    QrCodeGeneratorComponent,
    VisitorListComponent,
  ],
})
export class SharedModule {}