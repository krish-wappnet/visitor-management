import { CommonModule } from '@angular/common';
import { Component, Input, AfterViewInit, ElementRef, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code-generator',
  // standalone: false,
  imports: [CommonModule],
  templateUrl: './qr-code-generator.component.html',
  styleUrls: ['./qr-code-generator.component.css'],
})
export class QrCodeGeneratorComponent implements AfterViewInit, OnChanges {
  @Input() visitorData: string | null = null;
  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  errorMessage: string | null = null;

  ngAfterViewInit() {
    this.generateQRCode();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visitorData'] && this.qrCanvas) {
      this.generateQRCode();
    }
  }

  private generateQRCode() {
    this.errorMessage = null; // Reset error message
    if (this.visitorData && this.qrCanvas) {
      QRCode.toCanvas(this.qrCanvas.nativeElement, this.visitorData, {
        width: 256,
        errorCorrectionLevel: 'M',
      }, (error: any) => {
        if (error) {
          console.error('Error generating QR code:', error);
          this.errorMessage = 'Failed to generate QR code. Please try again.';
        }
      });
    } else if (!this.visitorData) {
      this.errorMessage = 'No visitor data provided for QR code generation.';
    }
  }
}