import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Visitor } from './visitor.model';
import { checkInVisitor, checkOutVisitor } from './visitor.actions';
import { Timestamp } from 'firebase/firestore';

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
          id: visitor.id,
          name: visitor.name,
          phone: visitor.phone,
          purpose: visitor.purpose,
          checkIn: visitor.checkIn instanceof Timestamp ? visitor.checkIn.toDate() : new Date(visitor.checkIn),
          stayDuration: visitor.stayDuration || 0,
          checkOutTime: visitor.checkOutTime ? (visitor.checkOutTime instanceof Timestamp ? visitor.checkOutTime.toDate() : new Date(visitor.checkOutTime)) : undefined,
          checkOut: visitor.checkOut ? (visitor.checkOut instanceof Timestamp ? visitor.checkOut.toDate() : new Date(visitor.checkOut)) : undefined,
          email: visitor.email,
          isCheckedIn: visitor.isCheckedIn !== undefined ? visitor.isCheckedIn : !visitor.checkOut,
          paymentId: visitor.paymentId, // Add paymentId
          paymentStatus: visitor.paymentStatus || 'pending', // Add paymentStatus with default
        } as Visitor))
      )
    );
  }

  addVisitor(visitor: Visitor): Promise<void> {
    const visitorDoc = doc(this.firestore, `visitors/${visitor.id}`);
    return setDoc(visitorDoc, {
      id: visitor.id,
      name: visitor.name,
      phone: visitor.phone,
      purpose: visitor.purpose,
      checkIn: visitor.checkIn,
      stayDuration: visitor.stayDuration,
      checkOutTime: visitor.checkOutTime || null,
      checkOut: visitor.checkOut || null,
      email: visitor.email || null,
      isCheckedIn: visitor.isCheckedIn,
      paymentId: visitor.paymentId || null, // Include paymentId
      paymentStatus: visitor.paymentStatus, // Include paymentStatus
    }).then(() => {
      this.store.dispatch(checkInVisitor({ visitor }));
    }).catch((error) => {
      console.error('Error adding visitor to Firebase:', error);
      throw error;
    });
  }

  removeVisitor(visitorId: string): Promise<void> {
    const visitorDoc = doc(this.firestore, `visitors/${visitorId}`);
    return updateDoc(visitorDoc, { 
      checkOut: new Date(), 
      isCheckedIn: false // Ensure isCheckedIn is updated
    }).then(() => {
      this.store.dispatch(checkOutVisitor({ id: visitorId }));
    }).catch((error) => {
      console.error('Error removing visitor from Firebase:', error);
      throw error;
    });
  }
}