import { Injectable, inject, NgZone } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any>;
  userRole$: Observable<string | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private ngZone: NgZone // Inject NgZone to ensure Angular context
  ) {
    this.user$ = user(this.auth);
    this.userRole$ = this.user$.pipe(
      switchMap(user => {
        if (user) {
          // Call a method to fetch the role within Angular's context
          return this.getUserRole(user.uid);
        }
        return [null];
      })
    );
  }

  // Method to fetch user role within Angular's context
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
      return credential.user;
    } catch (error) {
      console.error('Email login error:', error);
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
      return user;
    } catch (error) {
      console.error('Email signup error:', error);
      throw error;
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;
      const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));
      if (!userDoc.exists()) {
        await setDoc(doc(this.firestore, `users/${user.uid}`), {
          email: user.email,
          role: 'visitor',
        });
      }
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}