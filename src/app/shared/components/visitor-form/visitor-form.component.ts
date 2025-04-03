import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { checkInVisitor } from '../../../features/visitor/store/visitor.actions';
import { AuthService } from '../../../features/auth/store/auth.service';
import { Router } from '@angular/router';
import { selectUserEmail } from '../../../features/auth/store/auth.selectores'; // Fixed typo
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Visitor } from '../../../features/visitor/store/visitor.model';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { AuthState } from '../../../features/auth/store/auth.state';

@Component({
  selector: 'app-visitor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visitor-form.component.html',
  styleUrls: ['./visitor-form.component.css'],
})
export class VisitorFormComponent implements OnInit, OnDestroy {
  visitorForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  userEmail$: Observable<string | null | undefined>;
  currentTime: Date = new Date();
  private timeInterval: any;
  durationOptions = [1, 2, 4, 8];
  paymentPending: boolean = false;
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentElement: StripePaymentElement | null = null;
  @ViewChild('paymentElement') paymentElementRef!: ElementRef;
  currentStep: number = 1; // Multi-step form tracking

  private hourlyRate = 80; // 80 INR/hour
  private currency = 'inr';

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router
  ) {
    this.visitorForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      purpose: ['', Validators.required],
      stayDuration: [1, Validators.required],
    });
    this.userEmail$ = this.store.select(selectUserEmail);
  }

  async ngOnInit() {
    this.timeInterval = setInterval(() => (this.currentTime = new Date()), 1000);
    this.stripe = await loadStripe('pk_test_51R9jUuGj8OpeYr38GlOtvZbKno0cXRYRMzfpMbAltOt8dYVk3jvjMRBpB1tocp45hw5NrJNPyCNDvakm5uf0OpeH00vuI8W0wC');
  }

  ngOnDestroy() {
    if (this.timeInterval) clearInterval(this.timeInterval);
    if (this.paymentElement) this.paymentElement.unmount();
  }

  nextStep() {
    if (this.currentStep === 1 && this.visitorForm.controls['name'].valid && this.visitorForm.controls['phone'].valid && this.visitorForm.controls['purpose'].valid) {
      this.currentStep = 2;
    }
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  async onSubmit() {
    if (this.visitorForm.valid) {
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.errorMessage = 'You must be logged in to check in.';
        return;
      }

      const checkInTime = new Date();
      const stayDuration = this.visitorForm.value.stayDuration;
      const checkOutTime = new Date(checkInTime.getTime() + stayDuration * 60 * 60 * 1000);
      const totalCharge = stayDuration * this.hourlyRate * 100; // In paise

      const visitorId = doc(collection(this.firestore, 'visitors')).id;
      const visitor: Visitor = {
        id: visitorId,
        name: this.visitorForm.value.name,
        phone: this.visitorForm.value.phone,
        purpose: this.visitorForm.value.purpose,
        checkIn: checkInTime,
        stayDuration: stayDuration,
        checkOutTime: checkOutTime,
        email: user.email ?? undefined,
        isCheckedIn: false,
        paymentStatus: 'pending',
      };

      this.paymentPending = true;
      await this.initiatePayment(visitor, totalCharge);
    }
  }

  async initiatePayment(visitor: Visitor, amount: number) {
    try {
      const response = await fetch('https://us-central1-visitor-management-6aaf4.cloudfunctions.net/createPaymentIntent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          currency: this.currency,
          visitorId: visitor.id,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || response.statusText}`);
      }
      const { clientSecret } = await response.json();
      if (!this.stripe) throw new Error('Stripe not initialized');

      this.elements = this.stripe.elements({ clientSecret });
      this.paymentElement = this.elements.create('payment');
      this.paymentElement.mount(this.paymentElementRef.nativeElement);

      const submitButton = document.createElement('button');
      submitButton.textContent = 'Pay Now';
      submitButton.className = 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4';
      submitButton.onclick = async () => {
        const { error, paymentIntent } = await this.stripe!.confirmPayment({
          elements: this.elements!,
          confirmParams: { return_url: window.location.href },
          redirect: 'if_required',
        });
        if (error) {
          this.errorMessage = error.message || 'Payment failed';
          this.paymentPending = false;
        } else if (paymentIntent.status === 'succeeded') {
          await this.confirmCheckIn(visitor, paymentIntent.id);
        }
      };
      this.paymentElementRef.nativeElement.appendChild(submitButton);
    } catch (error: any) {
      this.errorMessage = 'Payment setup failed: ' + error.message;
      this.paymentPending = false;
    }
  }

  async confirmCheckIn(visitor: Visitor, paymentId: string) {
    visitor.isCheckedIn = true;
    visitor.paymentStatus = 'completed';
    visitor.paymentId = paymentId;

    const visitorDoc = doc(this.firestore, `visitors/${visitor.id}`);
    await setDoc(visitorDoc, visitor);
    this.store.dispatch(checkInVisitor({ visitor }));
    this.scheduleAutoCheckout(visitor);
    this.successMessage = 'Payment successful! Visit booked.';
    this.paymentPending = false;
    this.visitorForm.reset();
    setTimeout(() => {
      this.successMessage = '';
      this.router.navigate(['/visitor/my-visits']);
    }, 3000);
  }

  private scheduleAutoCheckout(visitor: Visitor) {
    const timeUntilCheckout = visitor.checkOutTime!.getTime() - new Date().getTime();
    setTimeout(async () => {
      const visitorDoc = doc(this.firestore, `visitors/${visitor.id}`);
      await setDoc(visitorDoc, { isCheckedIn: false, checkOut: new Date() }, { merge: true });
    }, timeUntilCheckout);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}