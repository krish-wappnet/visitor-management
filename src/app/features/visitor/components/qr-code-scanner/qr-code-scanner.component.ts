import { Component, OnInit } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { checkOutVisitor } from '../../store/visitor.actions';

@Component({
  selector: 'app-qr-code-scanner',
  templateUrl: './qr-code-scanner.component.html',
  styleUrls: ['./qr-code-scanner.component.scss'],
  standalone: false,
//   imports: [ZXingScannerModule],
})
export class QrCodeScannerComponent implements OnInit {
  scannerEnabled: boolean = true;
  deviceCurrent: MediaDeviceInfo | undefined;
  deviceList: MediaDeviceInfo[] = [];

  constructor(
    private firestore: Firestore,
    private toastr: ToastrService,
    private store: Store
  ) {}

  ngOnInit() {}

  onDeviceSelectChange(selected: string) {
    const device = this.deviceList.find(x => x.deviceId === selected);
    this.deviceCurrent = device;
  }

  onScanSuccess(result: string) {
    console.log('Scanned QR Code:', result); // Debug log
    this.scannerEnabled = false; // Stop scanning after a successful scan
    this.checkOutVisitor(result);
  }

  async checkOutVisitor(visitorId: string) {
    try {
      const visitorDoc = doc(this.firestore, `visitors/${visitorId}`);
      await updateDoc(visitorDoc, { checkOut: new Date() });
      this.store.dispatch(checkOutVisitor({ id: visitorId }));
      this.toastr.success('Visitor checked out successfully!');
    } catch (error: any) {
      console.error('Check-out failed:', error);
      this.toastr.error('Failed to check out: ' + error.message);
      this.scannerEnabled = true; // Re-enable scanner on error
    }
  }

  enableScanner() {
    this.scannerEnabled = true;
  }
}