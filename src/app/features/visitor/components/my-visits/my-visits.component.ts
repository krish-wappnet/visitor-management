import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../auth/store/auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Visitor } from '../../store/visitor.model';
import { Timestamp } from 'firebase/firestore';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-my-visits',
  standalone: false,
  templateUrl: './my-visits.component.html',
  styleUrls: ['./my-visits.component.scss'],
})
export class MyVisitsComponent implements OnInit {
  myVisits$: Observable<Visitor[]> = of([]);
  paginatedVisits: Visitor[] = [];
  userEmail: string | null = null;
  selectedVisitorId: string | null = null;
  currentPage: number = 1;
  pageSize: number = 5; // Maximum 5 entries per page
  totalPages: number = 1;
  allVisits: Visitor[] = []; // Store all visits for pagination

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
        this.myVisits$.subscribe(visits => {
          this.allVisits = visits;
          this.updatePagination();
        });
      } else {
        this.myVisits$ = of([]);
        this.allVisits = [];
        this.updatePagination();
      }
    });
  }

  ngOnInit() {}

  updatePagination() {
    this.totalPages = Math.ceil(this.allVisits.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedVisits = this.allVisits.slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getCheckOutUrl(visitorId: string): string {
    const projectId = environment.firebaseConfig.projectId;
    const region = 'us-central1'; // Replace with your Cloud Function region if different
    return `https://${region}-${projectId}.cloudfunctions.net/checkOutVisitor?visitorId=${visitorId}`;
  }

  showQRCode(visitorId: string) {
    this.selectedVisitorId = this.selectedVisitorId === visitorId ? null : visitorId;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToCheckIn() {
    this.router.navigate(['/visitor/checkin']);
  }
}