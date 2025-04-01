import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { checkInVisitor } from '../../../features/visitor/store/visitor.actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visitor-form',
  imports:[CommonModule, ReactiveFormsModule],
  templateUrl: './visitor-form.component.html',
  styleUrls: ['./visitor-form.component.css'],
})
export class VisitorFormComponent {
  visitorForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private afs: AngularFirestore
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
        id: this.afs.createId(),
        ...this.visitorForm.value,
        checkIn: new Date(),
      };

      this.afs
        .collection('visitors')
        .doc(visitor.id)
        .set(visitor)
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