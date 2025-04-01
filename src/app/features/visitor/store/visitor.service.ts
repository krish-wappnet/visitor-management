import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Visitor } from './visitor.model';
import { Store } from '@ngrx/store';
import { addVisitor, removeVisitor } from './visitor.actions';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  constructor(private firestore: AngularFirestore, private store: Store) {}

  // Get visitors from Firebase Firestore
  getVisitors(): Observable<Visitor[]> {
    return this.firestore.collection<Visitor>('visitors').valueChanges({ idField: 'id' });
  }

  // Add visitor to Firestore and dispatch to store
  addVisitor(visitor: Visitor) {
    this.firestore
      .collection('visitors')
      .add(visitor)
      .then(() => {
        // Dispatch to NgRx Store, pass the visitor as an object with 'visitor' property
        this.store.dispatch(addVisitor({ visitor }));
      });
  }

  // Remove visitor from Firestore and dispatch to store
  removeVisitor(visitorId: string) {
    this.firestore
      .doc(`visitors/${visitorId}`)
      .delete()
      .then(() => {
        // Dispatch to NgRx Store, pass the visitorId
        this.store.dispatch(removeVisitor({ visitorId }));
      });
  }
}
