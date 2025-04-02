import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { VisitorRoutingModule } from './visitor-routing.module';
import { VisitorCheckinComponent } from './components/visitor-checkin/visitor-checkin.component';
import { SharedModule } from '../../shared/shared.module';
import { VisitorComponent } from './visitor.component';
import { MyVisitsComponent } from './components/my-visits/my-visits.component';
import { QrCodeScannerComponent } from './components/qr-code-scanner/qr-code-scanner.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  declarations: [
    VisitorComponent,
    VisitorCheckinComponent,
    MyVisitsComponent,
    QrCodeScannerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    VisitorRoutingModule,
    SharedModule,
    ZXingScannerModule
  ],
})
export class VisitorModule {}