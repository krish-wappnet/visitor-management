import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Visitor } from './visitor.model';
import { checkInVisitor, checkOutVisitor } from './visitor.actions';

@Injectable({
  providedIn: 'root',
})
export class VisitorService {
  constructor(private afs: AngularFirestore, private store: Store) {}

  getVisitors(): Observable<Visitor[]> {
    return this.afs
      .collection<Visitor>('visitors')
      .valueChanges({ idField: 'id' })
      .pipe(
        map((visitors) =>
          visitors.map((visitor) => ({
            ...visitor,
            checkIn: (visitor.checkIn as any).toDate(),
            checkOut: visitor.checkOut ? (visitor.checkOut as any).toDate() : undefined,
          }))
        )
      );
  }

  addVisitor(visitor: Visitor) {
    this.afs
      .collection('visitors')
      .doc(visitor.id)
      .set({
        ...visitor,
        checkIn: visitor.checkIn, // Firebase will handle Date objects
        checkOut: visitor.checkOut || null,
      })
      .then(() => {
        this.store.dispatch(checkInVisitor({ visitor })); // Dispatch NgRx action
      })
      .catch((error) => {
        console.error('Error adding visitor to Firebase:', error);
      });
  }

  removeVisitor(visitorId: string) {
    this.afs
      .collection('visitors')
      .doc(visitorId)
      .update({ checkOut: new Date() })
      .then(() => {
        this.store.dispatch(checkOutVisitor({ id: visitorId })); // Dispatch NgRx action
      })
      .catch((error) => {
        console.error('Error removing visitor from Firebase:', error);
      });
  }
}