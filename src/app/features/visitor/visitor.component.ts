import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Visitor } from './store/visitor.model';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { checkInVisitor } from './store/visitor.actions';
import { map, tap } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';
import { AuthService } from '../../features/auth/store/auth.service';
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
  dateFilter: string = '';
  nameFilter: string = '';

  constructor(
    private store: Store,
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router
  ) {
    this.visitors$ = (collectionData(collection(this.firestore, 'visitors'), { idField: 'id' }) as Observable<Visitor[]>).pipe(
      map(visitors => visitors.map(v => ({
        id: v.id,
        name: v.name,
        phone: v.phone,
        purpose: v.purpose,
        checkIn: v.checkIn instanceof Timestamp ? v.checkIn.toDate() : new Date(v.checkIn),
        checkOut: v.checkOut ? (v.checkOut instanceof Timestamp ? v.checkOut.toDate() : new Date(v.checkOut)) : undefined
      }))),
      tap(visitors => visitors.forEach(v => this.store.dispatch(checkInVisitor({ visitor: v }))))
    );
    this.filteredVisitors$ = this.visitors$;
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
      const csvHeader = 'Name,Phone,Purpose,Check-In,Check-Out';
      const csvRows = visitors.map(v =>
        `${v.name},${v.phone},${v.purpose},${new Date(v.checkIn).toISOString()},${v.checkOut ? new Date(v.checkOut).toISOString() : ''}`
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
}