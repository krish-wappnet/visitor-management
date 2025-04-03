// auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { AuthState, initialState } from './auth.state';
import { loginSuccess, logout, loadUserFromStorage, loginFailure } from './auth.actions';

export const authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { user }) => ({ ...state, user, error: null })),
  on(logout, (state) => ({ ...state, user: null, error: null })),
  on(loadUserFromStorage, (state, { user }) => ({ ...state, user, error: null })),
  on(loginFailure, (state, { error }) => ({ ...state, error }))
);