import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { checkInVisitor } from '../../../features/visitor/store/visitor.actions';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../features/auth/store/auth.service';

@Component({
  selector: 'app-visitor-form',
  // standalone: false,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visitor-form.component.html',
  styleUrls: ['./visitor-form.component.css'],
})
export class VisitorFormComponent {
  visitorForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private firestore: Firestore,
    private authService: AuthService
  ) {
    this.visitorForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      purpose: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.visitorForm.valid) {
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.errorMessage = 'You must be logged in to check in.';
        return;
      }
      const visitorId = doc(collection(this.firestore, 'visitors')).id; // Generate visitor ID
      const visitor = {
        id: visitorId,
        ...this.visitorForm.value,
        checkIn: new Date(),
        email: user.email,
      };
      const visitorDoc = doc(this.firestore, `visitors/${visitor.id}`);
      try {
        await setDoc(visitorDoc, visitor);
        this.store.dispatch(checkInVisitor({ visitor }));
        this.visitorForm.reset();
      } catch (error: any) {
        this.errorMessage = 'Failed to check in: ' + error.message;
      }
    }
  }
}