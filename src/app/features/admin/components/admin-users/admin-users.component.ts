import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../../features/auth/store/auth.service';
import { Router } from '@angular/router';

interface User {
  id: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin-users',
  standalone:false,
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  users$: Observable<User[]>;
  userEmail: string | null = null;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router
  ) {
    this.users$ = (collectionData(collection(this.firestore, 'users'), { idField: 'id' }) as Observable<User[]>).pipe(
      map(users => users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role
      })))
    );

    this.authService.user$.subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
  }

  ngOnInit() {}

  async toggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'visitor' : 'admin';
    const userDoc = doc(this.firestore, `users/${user.id}`);
    try {
      await updateDoc(userDoc, { role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}