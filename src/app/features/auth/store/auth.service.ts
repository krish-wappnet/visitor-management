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
    private store: Store<{ auth: any }> // Inline state typing
  ) {
    this.user$ = user(this.auth);
    this.userRole$ = this.user$.pipe(
      switchMap(user => {
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

    this.user$.subscribe(firebaseUser => {
      if (firebaseUser) {
        this.getUserRole(firebaseUser.uid).subscribe(role => {
          firebaseUser.getIdToken().then((token: any) => {
            const user = { uid: firebaseUser.uid, email: firebaseUser.email, role, token };
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
        map(userDoc => userDoc.exists() ? userDoc.data()['role'] : null)
      );
    });
  }

  async loginWithEmail(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = credential.user;
      const role = await this.getUserRole(user.uid).toPromise();
      const token = await user.getIdToken(); // Get Firebase ID token
      const userData = { uid: user.uid, email: user.email, role, token };
      this.store.dispatch(loginSuccess({ user: userData }));
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
      });
      const token = await user.getIdToken(); // Get Firebase ID token
      const userData = { uid: user.uid, email: user.email, role: 'visitor', token };
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
      if (!userDoc.exists()) {
        role = 'visitor';
        await setDoc(doc(this.firestore, `users/${user.uid}`), {
          email: user.email,
          role,
        });
      }
      const token = await user.getIdToken(); // Get Firebase ID token
      const userData = { uid: user.uid, email: user.email, role, token };
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