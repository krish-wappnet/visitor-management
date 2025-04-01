import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, interval, Subscription } from 'rxjs';
import { selectLatestVisitor } from '../../store/visitor.selectors';
import { checkOutVisitor } from '../../store/visitor.actions';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore'; // Modern Firestore APIs

@Component({
  selector: 'app-visitor-checkin',
  standalone: false,
  templateUrl: './visitor-checkin.component.html',
  styleUrls: ['./visitor-checkin.component.css'],
})
export class VisitorCheckinComponent implements OnInit, OnDestroy {
  latestVisitorData$: Observable<string | null>;
  currentTime: Date = new Date();
  private clockSubscription!: Subscription;
  visitorId: string = '';

  constructor(private store: Store, private firestore: Firestore) { // Updated to Firestore
    this.latestVisitorData$ = this.store.select(selectLatestVisitor);
  }

  ngOnInit() {
    this.clockSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
    this.latestVisitorData$.subscribe(data => console.log('Latest Visitor:', data)); // Debug
  }

  ngOnDestroy() {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  onCheckOut() {
    if (this.visitorId) {
      const visitorDoc = doc(this.firestore, `visitors/${this.visitorId}`);
      updateDoc(visitorDoc, { checkOut: new Date() })
        .then(() => {
          this.store.dispatch(checkOutVisitor({ id: this.visitorId }));
          this.visitorId = '';
        })
        .catch((error) => {
          console.error('Error checking out visitor:', error);
        });
    }
  }
}