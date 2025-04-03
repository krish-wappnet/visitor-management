// auth.actions.ts
import { createAction, props } from '@ngrx/store';

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: { uid: string; email: string | null; role: string | null; status: string | null; token: string } }>()
);

export const logout = createAction('[Auth] Logout');

export const loadUserFromStorage = createAction(
  '[Auth] Load User From Storage',
  props<{ user: { uid: string; email: string | null; role: string | null; status: string | null; token: string } }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);