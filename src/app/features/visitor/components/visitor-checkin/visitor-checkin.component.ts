import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { Observable, interval, Subscription, map } from 'rxjs';
import { selectLatestVisitor } from '../../store/visitor.selectors';
import { AuthService } from '../../../auth/store/auth.service';
import { Router } from '@angular/router';
import { Visitor } from '../../store/visitor.model';

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
  successMessage: string = '';
  userEmail: string | null = null;

  constructor(
    private store: Store,
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router
  ) {
    // Type as Observable<Visitor | null> to match the selector
    const latestVisitor$: Observable<Visitor | null> = this.store.select(selectLatestVisitor);

    // Map to the ID (string | null)
    this.latestVisitorData$ = latestVisitor$.pipe(
      map(visitor => (visitor ? visitor.id : null))
    );

    // Subscribe to show success message
    latestVisitor$.subscribe(data => {
      if (data) {
        this.successMessage = 'Visitor checked in successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }
    });

    this.authService.user$.subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
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

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}