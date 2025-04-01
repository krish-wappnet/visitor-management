import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, interval, Subscription } from 'rxjs';
import { selectLatestVisitor } from '../../store/visitor.selectors';
import { checkOutVisitor } from '../../store/visitor.actions';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { VisitorFormComponent } from "../../../../shared/components/visitor-form/visitor-form.component";
import { QrCodeGeneratorComponent } from "../../../../shared/components/qr-code-generator/qr-code-generator.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visitor-checkin',
  templateUrl: './visitor-checkin.component.html',
  styleUrls: ['./visitor-checkin.component.css'],
  imports: [VisitorFormComponent, QrCodeGeneratorComponent,FormsModule, CommonModule],
})
export class VisitorCheckinComponent implements OnInit, OnDestroy {
  latestVisitorData$: Observable<string | null>;
  currentTime: Date = new Date();
  private clockSubscription!: Subscription;
  visitorId: string = '';

  constructor(private store: Store, private afs: AngularFirestore) {
    this.latestVisitorData$ = this.store.select(selectLatestVisitor);
  }

  ngOnInit() {
    this.clockSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  ngOnDestroy() {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  onCheckOut() {
    if (this.visitorId) {
      this.afs
        .collection('visitors')
        .doc(this.visitorId)
        .update({ checkOut: new Date() })
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