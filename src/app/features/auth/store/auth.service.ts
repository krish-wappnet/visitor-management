// auth.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { loginSuccess, logout, loadUserFromStorage, loginFailure } from './auth.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any>;
  userRole$: Observable<string | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private ngZone: NgZone,
    private store: Store<{ auth: any }>
  ) {
    this.user$ = user(this.auth);
    this.userRole$ = this.user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.getUserRole(user.uid);
        }
        return [null];
      })
    );

    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.store.dispatch(loadUserFromStorage({ user }));
    }

    this.user$.subscribe((firebaseUser) => {
      if (firebaseUser) {
        this.getUserData(firebaseUser.uid).subscribe((userData) => {
          firebaseUser.getIdToken().then((token: any) => {
            const user = { uid: firebaseUser.uid, email: firebaseUser.email, role: userData?.role, status: userData?.status, token };
            this.store.dispatch(loginSuccess({ user }));
          });
        });
      } else {
        this.store.dispatch(logout());
      }
    });
  }

  private getUserRole(uid: string): Observable<string | null> {
    return this.ngZone.run(() => {
      return from(getDoc(doc(this.firestore, `users/${uid}`))).pipe(
        map((userDoc) => (userDoc.exists() ? userDoc.data()['role'] : null))
      );
    });
  }

  private getUserData(uid: string): Observable<any> {
    return this.ngZone.run(() => {
      return from(getDoc(doc(this.firestore, `users/${uid}`))).pipe(
        map((userDoc) => (userDoc.exists() ? userDoc.data() : null))
      );
    });
  }

  async loginWithEmail(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = credential.user;
      const userData = (await getDoc(doc(this.firestore, `users/${user.uid}`))).data();
      const token = await user.getIdToken();
      const authData = { uid: user.uid, email: user.email, role: userData?.['role'], status: userData?.['status'], token };
      this.store.dispatch(loginSuccess({ user: authData }));
      return user;
    } catch (error: any) {
      this.store.dispatch(loginFailure({ error: error.message }));
      throw error;
    }
  }

  async signupWithEmail(email: string, password: string) {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = credential.user;
      await setDoc(doc(this.firestore, `users/${user.uid}`), {
        email: user.email,
        role: 'visitor',
        status: 'pending', // Set status to "pending" for new users
        createdAt: new Date(),
      });
      const token = await user.getIdToken();
      const userData = { uid: user.uid, email: user.email, role: 'visitor', status: 'pending', token };
      this.store.dispatch(loginSuccess({ user: userData }));
      return user;
    } catch (error: any) {
      this.store.dispatch(loginFailure({ error: error.message }));
      throw error;
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;
      const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));
      let role = userDoc.exists() ? userDoc.data()['role'] : null;
      let status = userDoc.exists() ? userDoc.data()['status'] : null;

      if (!userDoc.exists()) {
        role = 'visitor';
        status = 'pending'; // Set status to "pending" for new Google users
        await setDoc(doc(this.firestore, `users/${user.uid}`), {
          email: user.email,
          role,
          status,
          createdAt: new Date(),
        });
      }

      const token = await user.getIdToken();
      const userData = { uid: user.uid, email: user.email, role, status, token };
      this.store.dispatch(loginSuccess({ user: userData }));
      return user;
    } catch (error: any) {
      this.store.dispatch(loginFailure({ error: error.message }));
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.store.dispatch(logout());
    } catch (error: any) {
      this.store.dispatch(loginFailure({ error: error.message }));
      throw error;
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}