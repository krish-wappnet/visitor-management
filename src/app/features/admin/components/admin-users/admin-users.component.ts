// admin-users.component.ts
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore'; // Modern API
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../auth/store/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  users$: Observable<any[]>;
  userEmail: string | null = null;

  constructor(
    private firestore: Firestore, // Use modern Firestore
    private authService: AuthService,
    private router: Router
  ) {
    // Fetch users using collectionData
    this.users$ = (collectionData(collection(this.firestore, 'users'), { idField: 'id' }) as Observable<any[]>).pipe(
      map(users => users.map(user => ({ id: user.id, ...user })))
      
    );

    this.authService.user$.subscribe(user => {
      this.userEmail = user ? user.email : null;
      console.log('Current user:', user);
    });
  }

  ngOnInit(): void {}

  approveUser(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    updateDoc(userRef, { status: 'approved' })
      .then(() => console.log(`User ${uid} approved`))
      .catch((error) => console.error('Error approving user:', error));
  }

  rejectUser(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    updateDoc(userRef, { status: 'rejected' })
      .then(() => console.log(`User ${uid} rejected`))
      .catch((error) => console.error('Error rejecting user:', error));
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}