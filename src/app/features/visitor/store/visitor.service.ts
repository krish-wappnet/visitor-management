import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc } from '@angular/fire/firestore'; // Modern Firestore
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Visitor } from './visitor.model';
import { checkInVisitor, checkOutVisitor } from './visitor.actions';

@Injectable({
  providedIn: 'root',
})
export class VisitorService {
  constructor(private firestore: Firestore, private store: Store) {}

  getVisitors(): Observable<Visitor[]> {
    const visitorsCollection = collection(this.firestore, 'visitors');
    return collectionData(visitorsCollection, { idField: 'id' }).pipe(
      map((visitors: any[]) =>
        visitors.map((visitor) => ({
          ...visitor,
          checkIn: visitor.checkIn.toDate(), // Firestore Timestamp to Date
          checkOut: visitor.checkOut ? visitor.checkOut.toDate() : undefined,
        }))
      )
    );
  }

  addVisitor(visitor: Visitor): Promise<void> {
    const visitorDoc = doc(this.firestore, `visitors/${visitor.id}`);
    return setDoc(visitorDoc, {
      ...visitor,
      checkIn: visitor.checkIn,
      checkOut: visitor.checkOut || null,
    }).then(() => {
      this.store.dispatch(checkInVisitor({ visitor }));
    }).catch((error) => {
      console.error('Error adding visitor to Firebase:', error);
      throw error;
    });
  }

  removeVisitor(visitorId: string): Promise<void> {
    const visitorDoc = doc(this.firestore, `visitors/${visitorId}`);
    return updateDoc(visitorDoc, { checkOut: new Date() }).then(() => {
      this.store.dispatch(checkOutVisitor({ id: visitorId }));
    }).catch((error) => {
      console.error('Error removing visitor from Firebase:', error);
      throw error;
    });
  }
}