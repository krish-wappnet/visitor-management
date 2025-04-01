import { CommonModule } from '@angular/common';
import { Component, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code-generator',
  imports:[CommonModule],
  templateUrl: './qr-code-generator.component.html',
  styleUrls: ['./qr-code-generator.component.css'],
})
export class QrCodeGeneratorComponent implements AfterViewInit {
  @Input() visitorData: string | null = null;
  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    if (this.visitorData && this.qrCanvas) {
      QRCode.toCanvas(this.qrCanvas.nativeElement, this.visitorData, {
        width: 256,
        errorCorrectionLevel: 'M',
      }, (error: any) => {
        if (error) {
          console.error('Error generating QR code:', error);
        }
      });
    }
  }
}