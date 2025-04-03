import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Visitor } from './store/visitor.model';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { checkInVisitor } from './store/visitor.actions';
import { map, tap } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';
import { AuthService } from '../auth/store/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-visitor',
  standalone: false,
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.scss'],
})
export class VisitorComponent implements OnInit {
  visitors$: Observable<Visitor[]>;
  filteredVisitors$: Observable<Visitor[]>;
  recentActivity$: Observable<Visitor[]>;
  totalVisitorsToday$: Observable<number>;
  activeVisitors$: Observable<number>;
  totalVisitorsAllTime$: Observable<number>;
  dateFilter: string = '';
  nameFilter: string = '';
  userEmail: string | null = null;

  constructor(
    private store: Store,
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router
  ) {
    this.visitors$ = (collectionData(collection(this.firestore, 'visitors'), { idField: 'id' }) as Observable<any[]>).pipe(
      map(visitors => visitors.map(v => ({
        id: v.id,
        name: v.name,
        phone: v.phone,
        purpose: v.purpose,
        checkIn: v.checkIn instanceof Timestamp ? v.checkIn.toDate() : new Date(v.checkIn),
        stayDuration: v.stayDuration || 0, // Default to 0 if not present (adjust as needed)
        checkOutTime: v.checkOutTime ? (v.checkOutTime instanceof Timestamp ? v.checkOutTime.toDate() : new Date(v.checkOutTime)) : undefined,
        checkOut: v.checkOut ? (v.checkOut instanceof Timestamp ? v.checkOut.toDate() : new Date(v.checkOut)) : undefined,
        email: v.email,
        isCheckedIn: v.isCheckedIn !== undefined ? v.isCheckedIn : !v.checkOut, // Infer from checkOut if missing
      } as Visitor))),
      tap(visitors => visitors.forEach(v => this.store.dispatch(checkInVisitor({ visitor: v }))))
    );

    // Stats
    this.totalVisitorsToday$ = this.visitors$.pipe(
      map(visitors => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return visitors.filter(v => {
          const checkInDate = new Date(v.checkIn);
          return checkInDate >= today;
        }).length;
      })
    );

    this.activeVisitors$ = this.visitors$.pipe(
      map(visitors => visitors.filter(v => v.isCheckedIn).length) // Updated to use isCheckedIn
    );

    this.totalVisitorsAllTime$ = this.visitors$.pipe(
      map(visitors => visitors.length)
    );

    // Recent Activity (last 5 check-ins/check-outs)
    this.recentActivity$ = this.visitors$.pipe(
      map(visitors => {
        const sorted = [...visitors].sort((a, b) => {
          const aDate = a.checkOut ? new Date(a.checkOut) : new Date(a.checkIn);
          const bDate = b.checkOut ? new Date(b.checkOut) : new Date(b.checkIn);
          return bDate.getTime() - aDate.getTime();
        });
        return sorted.slice(0, 5);
      })
    );

    this.filteredVisitors$ = this.visitors$;

    // User email
    this.authService.user$.subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
  }

  ngOnInit() {}

  filterByDate(event: Event) {
    this.dateFilter = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  filterByName(event: Event) {
    this.nameFilter = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredVisitors$ = this.visitors$.pipe(
      map(visitors => visitors.filter(v => {
        const checkInDate = new Date(v.checkIn).toDateString();
        const filterDate = this.dateFilter ? new Date(this.dateFilter).toDateString() : '';
        return (
          (!filterDate || checkInDate === filterDate) &&
          (!this.nameFilter || v.name.toLowerCase().includes(this.nameFilter))
        );
      }))
    );
  }

  exportData() {
    this.visitors$.subscribe(visitors => {
      const csvHeader = 'Name,Phone,Purpose,Check-In,Check-Out,Stay Duration,Checked In';
      const csvRows = visitors.map(v =>
        `${v.name},${v.phone},${v.purpose},${new Date(v.checkIn).toISOString()},${v.checkOut ? new Date(v.checkOut).toISOString() : ''},${v.stayDuration},${v.isCheckedIn}`
      );
      const csv = [csvHeader, ...csvRows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'visitor_logs.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  goToCheckIn() {
    this.router.navigate(['/visitor/checkin']);
  }
}