import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore'; // Modern Firestore APIs
import { checkInVisitor } from '../../../features/visitor/store/visitor.actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visitor-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visitor-form.component.html',
  styleUrls: ['./visitor-form.component.css'],
})
export class VisitorFormComponent {
  visitorForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private firestore: Firestore // Updated to modern Firestore
  ) {
    this.visitorForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      purpose: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.visitorForm.valid) {
      const visitor = {
        id: doc(collection(this.firestore, 'visitors')).id, // Generate ID using modern API
        ...this.visitorForm.value,
        checkIn: new Date(),
      };

      const visitorDoc = doc(this.firestore, `visitors/${visitor.id}`);
      setDoc(visitorDoc, visitor) // Modern Firestore operation
        .then(() => {
          this.store.dispatch(checkInVisitor({ visitor }));
          this.visitorForm.reset();
        })
        .catch((error) => {
          console.error('Error saving visitor to Firebase:', error);
        });
    }
  }
}