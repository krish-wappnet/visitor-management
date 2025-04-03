import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { checkInVisitor } from '../../../features/visitor/store/visitor.actions';
import { AuthService } from '../../../features/auth/store/auth.service';
import { Router } from '@angular/router';
import { selectUserEmail } from '../../../features/auth/store/auth.selectores';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthState } from '../../../features/auth/store/auth.state';
import { Visitor } from '../../../features/visitor/store/visitor.model'; // Import the updated model

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
  userEmail$: Observable<string | null | undefined>;
  currentTime: Date = new Date();
  private timeInterval: any;
  durationOptions = [1, 2, 4, 8]; // Available stay durations in hours

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
      stayDuration: [1, Validators.required], // Default to 1 hour
    });

    this.userEmail$ = this.store.select(selectUserEmail);
  }

  ngOnInit(): void {
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
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
        isCheckedIn: true,
      };

      const visitorDoc = doc(this.firestore, `visitors/${visitor.id}`);
      try {
        await setDoc(visitorDoc, visitor);
        this.store.dispatch(checkInVisitor({ visitor }));
        this.scheduleAutoCheckout(visitor); // Schedule auto-checkout
        this.visitorForm.reset();
        this.router.navigate(['/visitor/my-visits']);
      } catch (error: any) {
        this.errorMessage = 'Failed to check in: ' + error.message;
      }
    }
  }

  private scheduleAutoCheckout(visitor: Visitor) {
    const timeUntilCheckout = visitor.checkOutTime!.getTime() - new Date().getTime();
    setTimeout(async () => {
      const visitorDoc = doc(this.firestore, `visitors/${visitor.id}`);
      await setDoc(visitorDoc, { isCheckedIn: false, checkOut: new Date() }, { merge: true });
      // Optionally dispatch an action to update NgRx store
      // this.store.dispatch(checkOutVisitor({ visitorId: visitor.id }));
    }, timeUntilCheckout);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}