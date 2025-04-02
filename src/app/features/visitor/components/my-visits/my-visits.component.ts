import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../../features/auth/store/auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs'; // Import 'of' for initial value
import { Visitor } from '../../store/visitor.model';
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-my-visits',
  standalone:false,
  templateUrl: './my-visits.component.html',
  styleUrls: ['./my-visits.component.scss'],
})
export class MyVisitsComponent implements OnInit {
  myVisits$: Observable<Visitor[]> = of([]); // Initialize with empty observable
  userEmail: string | null = null;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.user$.subscribe(user => {
      this.userEmail = user ? user.email : null;
      if (user && user.email) {
        const visitsQuery = query(
          collection(this.firestore, 'visitors'),
          where('email', '==', user.email)
        );
        this.myVisits$ = (collectionData(visitsQuery, { idField: 'id' }) as Observable<Visitor[]>).pipe(
          map(visits => visits.map(v => ({
            ...v,
            checkIn: v.checkIn instanceof Timestamp ? v.checkIn.toDate() : new Date(v.checkIn),
            checkOut: v.checkOut ? (v.checkOut instanceof Timestamp ? v.checkOut.toDate() : new Date(v.checkOut)) : undefined
          })))
        );
      } else {
        this.myVisits$ = of([]); // Reset to empty if no user
      }
    });
  }

  ngOnInit() {}

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToCheckIn() {
    this.router.navigate(['/visitor/checkin']);
  }
}