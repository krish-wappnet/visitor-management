import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { loginSuccess, logout } from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions) {}

  persistUser$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ user }) => localStorage.setItem('authUser', JSON.stringify(user))) // Stores uid, email, role, token
      ),
    { dispatch: false }
  );

  clearUser$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => localStorage.removeItem('authUser'))
      ),
    { dispatch: false }
  );
}